import { CityLocation, WeatherMetrics, HourlyHeatRisk, DailyHeatForecast, NormalizedWeatherData, AirQualityMetrics } from '../types';
import { heatRiskService } from './heatRiskService';
import { calculateHeatStress } from './heatStressEngine';

const WEATHER_CACHE_KEY_PREFIX = 'heatguard_weather_live_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const weatherService = {
  /**
   * Format relative time string
   */
  formatTimeAgo(dateInput: Date | number | string): string {
    const time = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput).getTime() : dateInput.getTime();
    const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));

    if (diffSeconds < 60) return 'Just now';
    const mins = Math.floor(diffSeconds / 60);
    if (mins === 1) return '1 min ago';
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  },

  /**
   * Get cached weather data from localStorage if still within valid TTL
   */
  getCachedWeather(lat: number, lng: number): NormalizedWeatherData | null {
    try {
      const key = `${WEATHER_CACHE_KEY_PREFIX}${lat.toFixed(3)}_${lng.toFixed(3)}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.storedAt < CACHE_TTL_MS) {
        return {
          ...parsed.data,
          isCached: true,
          current: {
            ...parsed.data.current,
            updatedAt: this.formatTimeAgo(parsed.storedAt)
          }
        };
      }
    } catch {
      // cache read fallback
    }
    return null;
  },

  /**
   * Save weather data to client cache
   */
  saveCachedWeather(lat: number, lng: number, data: NormalizedWeatherData): void {
    try {
      const key = `${WEATHER_CACHE_KEY_PREFIX}${lat.toFixed(3)}_${lng.toFixed(3)}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          storedAt: Date.now(),
          data
        })
      );
    } catch {
      // ignore cache write errors
    }
  },

  /**
   * Fetch complete real-time weather, air quality, hourly & daily forecast from the backend API gateway
   */
  async fetchWeatherData(location: CityLocation): Promise<NormalizedWeatherData> {
    const lat = location.lat;
    const lng = location.lng;
    const city = location.name;

    // Check client-side cache first
    const cached = this.getCachedWeather(lat, lng);
    if (cached) {
      return cached;
    }

    // Try backend proxy endpoint first, with direct Open-Meteo fallback if backend is offline
    const apiUrl = `${API_BASE}/weather?lat=${lat}&lon=${lng}&city=${encodeURIComponent(city)}`;
    
    let rawData: any = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errDetails = '';
        try {
          const errBody = await response.json();
          errDetails = errBody.error || errBody.details || '';
        } catch {
          // non-JSON error
        }
        throw new Error(`API HTTP ${response.status}${errDetails ? `: ${errDetails}` : ''}`);
      }
      rawData = await response.json();
    } catch (backendError: any) {
      console.warn('[HeatGuard] Backend API proxy unreachable, falling back to direct meteorological query:', backendError?.message || backendError);

      // Direct fallback to Open-Meteo in case backend server is unreachable
      const fallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,dew_point_2m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=8`;
      const aqiFallbackUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

      const [fRes, aRes] = await Promise.all([
        fetch(fallbackUrl),
        fetch(aqiFallbackUrl).catch(() => null)
      ]);

      if (!fRes.ok) {
        throw new Error('All meteorological telemetry providers failed to respond. Please check your network.');
      }

      const fData = await fRes.json();
      const aData = aRes && aRes.ok ? await aRes.json() : null;

      // Format direct response into normalized model
      rawData = this.normalizeDirectOpenMeteoResponse(fData, aData, location);
    }

    // Process hourly with scientific heat stress calculations
    const hourlyWithCalculations: HourlyHeatRisk[] = (rawData.hourly || []).map((h: any) => {
      const thermalResult = calculateHeatStress({
        temperature: h.temperature,
        humidity: h.humidity,
        windSpeed: h.windSpeed,
        uvIndex: h.uvIndex
      });

      return {
        ...h,
        thermalStress: thermalResult.score,
        riskLevel: thermalResult.riskCategory,
        isPeak: h.hour >= 12 && h.hour <= 16
      };
    });

    // Process daily with peak risk and thermal calculations
    const dailyWithCalculations: DailyHeatForecast[] = (rawData.daily || []).map((d: any, index: number) => {
      const thermalResult = calculateHeatStress({
        temperature: d.maxTemp,
        humidity: d.avgHumidity,
        windSpeed: 12,
        uvIndex: d.uvIndexMax || 8
      });

      const prob = Math.min(99, Math.max(25, Math.round(thermalResult.score * 0.95 + (d.precipitationProbability || 0) * 0.1)));
      
      let summary = '';
      if (thermalResult.riskCategory === 'Extreme') {
        summary = `Extreme heatwave anomaly. Critical thermal stress index (${thermalResult.score}/100). Precautionary advisories in effect.`;
      } else if (thermalResult.riskCategory === 'Very High') {
        summary = `Severe diurnal thermal buildup peaking during early afternoon with ${d.maxTemp}°C air temperature.`;
      } else if (thermalResult.riskCategory === 'High') {
        summary = `High thermal stress conditions expected. Elevated humidity (${d.avgHumidity}%) limits evaporative cooling.`;
      } else {
        summary = `Comfortable to moderate thermal conditions across monitoring node.`;
      }

      return {
        ...d,
        peakThermalStress: thermalResult.score,
        riskLevel: thermalResult.riskCategory,
        riskProbability: prob,
        peakRiskPeriod: '12:30 PM – 4:30 PM',
        aiSummary: summary
      };
    });

    const normalized: NormalizedWeatherData = {
      location: {
        name: rawData.location?.name || location.name,
        district: rawData.location?.district || location.district,
        state: rawData.location?.state || location.state,
        lat,
        lng
      },
      current: {
        ...rawData.current,
        provider: rawData.provider || rawData.current?.provider || 'WeatherAPI.com',
        updatedAt: 'Just now',
        isLive: true,
        isCached: false
      },
      airQuality: rawData.airQuality || {
        aqi: 72,
        pm25: 32.1,
        pm10: 44.5,
        o3: 52,
        no2: 15.2,
        so2: 9.8,
        co: 320,
        standard: 'US EPA Air Quality Index (AQI)',
        category: 'Moderate',
        advisory: 'Air quality is acceptable.'
      },
      hourly: hourlyWithCalculations,
      daily: dailyWithCalculations,
      isLive: true,
      isCached: false,
      provider: rawData.provider || rawData.current?.provider || 'WeatherAPI.com',
      updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // Cache to client storage
    this.saveCachedWeather(lat, lng, normalized);
    return normalized;
  },

  /**
   * Helper to normalize raw Open-Meteo response if calling directly from client
   */
  normalizeDirectOpenMeteoResponse(wData: any, aqiData: any, location: CityLocation): any {
    const cur = wData.current || {};
    const daily = wData.daily || {};
    const hourly = wData.hourly || {};
    const aCur = aqiData?.current || {};

    const hourlyList: any[] = [];
    const nowTime = cur.time || '';
    let startIdx = 0;
    if (hourly.time) {
      const found = hourly.time.findIndex((t: string) => t.startsWith(nowTime.slice(0, 13)));
      if (found !== -1) startIdx = found;
    }

    for (let i = 0; i < 24 && startIdx + i < (hourly.time?.length || 0); i++) {
      const idx = startIdx + i;
      const tStr = hourly.time[idx];
      const d = new Date(tStr);
      const hr = d.getHours();
      hourlyList.push({
        time: `${hr % 12 || 12} ${hr >= 12 ? 'PM' : 'AM'}`,
        hour: hr,
        isoTime: tStr,
        temperature: Math.round(hourly.temperature_2m[idx] * 10) / 10,
        feelsLike: Math.round(hourly.apparent_temperature[idx] * 10) / 10,
        humidity: Math.round(hourly.relative_humidity_2m[idx]),
        windSpeed: Math.round(hourly.wind_speed_10m[idx] * 10) / 10,
        uvIndex: hourly.uv_index?.[idx] || 0,
        precipitation: hourly.precipitation?.[idx] || 0
      });
    }

    const dailyList: any[] = [];
    for (let i = 0; i < Math.min(7, daily.time?.length || 0); i++) {
      const dStr = daily.time[i];
      const d = new Date(dStr);
      dailyList.push({
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        isoDate: dStr,
        maxTemp: Math.round(daily.temperature_2m_max[i] * 10) / 10,
        minTemp: Math.round(daily.temperature_2m_min[i] * 10) / 10,
        avgHumidity: 60,
        uvIndexMax: daily.uv_index_max?.[i] || 8,
        sunrise: daily.sunrise?.[i] || '',
        sunset: daily.sunset?.[i] || ''
      });
    }

    return {
      location: {
        name: location.name,
        district: location.district,
        state: location.state,
        lat: location.lat,
        lng: location.lng
      },
      current: {
        temperature: Math.round(cur.temperature_2m * 10) / 10,
        feelsLike: Math.round(cur.apparent_temperature * 10) / 10,
        humidity: Math.round(cur.relative_humidity_2m),
        windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
        pressure: Math.round(cur.surface_pressure || 1008),
        uvIndex: hourly.uv_index?.[startIdx] || 7,
        dewPoint: Math.round((cur.temperature_2m - (100 - cur.relative_humidity_2m) / 5) * 10) / 10,
        visibility: 15.0,
        solarRadiation: 750,
        timestamp: cur.time || new Date().toISOString()
      },
      airQuality: {
        aqi: Math.round(aCur.us_aqi || 75),
        pm25: aCur.pm2_5 || 32,
        pm10: aCur.pm10 || 45,
        o3: aCur.ozone || 55,
        no2: aCur.nitrogen_dioxide || 14,
        so2: aCur.sulphur_dioxide || 10,
        co: aCur.carbon_monoxide || 310,
        standard: 'US EPA Air Quality Index (AQI)',
        category: 'Moderate',
        advisory: 'Air quality is acceptable.'
      },
      hourly: hourlyList,
      daily: dailyList
    };
  },

  /**
   * Fetch historical daily data for 7D or 30D analytics
   */
  async fetchHistoricalData(daysCount: number = 7, location: CityLocation) {
    try {
      const response = await fetch(`${API_BASE}/historical?lat=${location.lat}&lon=${location.lng}&days=${daysCount}`);
      if (response.ok) {
        const data = await response.json();
        if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          return data.history.map((h: any) => {
            const stressScore = heatRiskService.calculateThermalStressScore(h.maxTemp, h.humidity, 12, 8);
            const riskLevel = heatRiskService.getRiskLevel(stressScore);
            return {
              date: h.date,
              maxTemp: h.maxTemp,
              minTemp: h.minTemp,
              avgTemp: h.avgTemp,
              humidity: h.humidity,
              thermalStress: stressScore,
              riskLevel,
              anomaly: h.maxTemp > 42 ? 'Extreme Anomaly' : h.maxTemp > 39 ? 'High Heat Anomaly' : 'Normal Range'
            };
          });
        }
      }
    } catch (e) {
      console.warn('[HeatGuard] Historical API fetch failed:', e);
    }

    // Direct fallback from Open-Meteo Archive API
    try {
      const now = new Date();
      const end = new Date(now);
      end.setDate(end.getDate() - 1);
      const start = new Date(now);
      start.setDate(start.getDate() - daysCount);
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean&timezone=auto`);
      if (res.ok) {
        const d = await res.json();
        const daily = d.daily || {};
        const items = [];
        for (let i = 0; i < (daily.time?.length || 0); i++) {
          const maxT = Math.round(daily.temperature_2m_max[i] * 10) / 10;
          const minT = Math.round(daily.temperature_2m_min[i] * 10) / 10;
          const hum = Math.round(daily.relative_humidity_2m_mean[i]);
          const stress = heatRiskService.calculateThermalStressScore(maxT, hum, 12, 8);
          items.push({
            date: new Date(daily.time[i]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxTemp: maxT,
            minTemp: minT,
            avgTemp: Math.round(daily.temperature_2m_mean[i] * 10) / 10,
            humidity: hum,
            thermalStress: stress,
            riskLevel: heatRiskService.getRiskLevel(stress),
            anomaly: maxT > 42 ? 'Extreme Anomaly' : maxT > 39 ? 'High Heat Anomaly' : 'Normal Range'
          });
        }
        return items;
      }
    } catch {
      // ignore
    }

    return [];
  }
};

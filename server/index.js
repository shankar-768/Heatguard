import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const apiRouter = express.Router();

// Base diagnostic endpoint
apiRouter.get('/', (req, res) => {
  res.json({ status: 'ok', backend: 'connected', service: 'HeatGuard AI Gateway' });
});

// In-memory cache for weather & geocoding to prevent excessive external requests
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache window

function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setInCache(key, data) {
  cache.set(key, {
    timestamp: Date.now(),
    data
  });
}

/**
 * Convert degrees to cardinal direction
 */
function degreesToCompass(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5);
  return directions[index % 16];
}

/**
 * Interpret WMO Weather code (standard used by WMO & Open-Meteo)
 */
function interpretWmoCode(code) {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', description: 'Sunny and clear conditions' };
    case 1:
      return { condition: 'Mainly Clear', description: 'Mainly clear with sparse clouds' };
    case 2:
      return { condition: 'Partly Cloudy', description: 'Scattered cloud cover' };
    case 3:
      return { condition: 'Overcast', description: 'Heavy cloud cover and shade' };
    case 45:
    case 48:
      return { condition: 'Fog', description: 'Foggy conditions and limited visibility' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', description: 'Light moisture drizzle' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain', description: 'Sustained rainfall' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snow', description: 'Snowfall' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', description: 'Convective rain showers' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', description: 'Severe convective thunderstorms' };
    default:
      return { condition: 'Clear', description: 'Pleasant weather conditions' };
  }
}

/**
 * Determine US EPA AQI category and advisory
 */
function getAqiCategory(aqi) {
  if (aqi <= 50) {
    return { category: 'Good', advisory: 'Air quality is satisfactory with minimal risk.' };
  }
  if (aqi <= 100) {
    return { category: 'Moderate', advisory: 'Air quality is acceptable; unusually sensitive individuals should take care.' };
  }
  if (aqi <= 150) {
    return { category: 'Unhealthy for Sensitive Groups', advisory: 'Members of sensitive groups may experience health effects.' };
  }
  if (aqi <= 200) {
    return { category: 'Unhealthy', advisory: 'Everyone may begin to experience health effects; active children and adults should limit exertion.' };
  }
  if (aqi <= 300) {
    return { category: 'Very Unhealthy', advisory: 'Health alert: increased risk of cardiovascular and respiratory complications.' };
  }
  return { category: 'Hazardous', advisory: 'Emergency health warning: entire population is likely to be affected.' };
}

/**
 * Compute official US EPA AQI from PM2.5 (ug/m3) concentration
 */
function calculateEpaAqi(pm25) {
  if (pm25 == null || isNaN(pm25)) return 50;
  const breakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 }
  ];
  for (const bp of breakpoints) {
    if (pm25 <= bp.cHigh) {
      return Math.round(((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow);
    }
  }
  return 500;
}

/**
 * Fetch real-time weather, air quality, 48h hourly, and 7-day forecast from WeatherAPI.com
 */
async function fetchFromWeatherApi(lat, lon, cityName, apiKey) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=yes&alerts=yes`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'HeatGuard-AI/2.0' }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WeatherAPI request failed (HTTP ${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const cur = data.current || {};
  const aqiRaw = cur.air_quality || {};
  const forecastDays = data.forecast?.forecastday || [];
  const day0 = forecastDays[0] || {};
  const astro0 = day0.astro || {};

  // Determine EPA AQI from real sensor telemetry
  let aqiVal = 50;
  if (aqiRaw.pm2_5 != null) {
    aqiVal = calculateEpaAqi(aqiRaw.pm2_5);
  } else if (aqiRaw['us-epa-index'] != null) {
    const epaMap = { 1: 35, 2: 75, 3: 125, 4: 165, 5: 225, 6: 350 };
    aqiVal = epaMap[aqiRaw['us-epa-index']] || 50;
  }
  const aqiCategoryInfo = getAqiCategory(aqiVal);

  // Hourly forecast across all 7 forecast days starting from current hour
  const allHours = [];
  for (const fday of forecastDays) {
    if (Array.isArray(fday.hour)) {
      allHours.push(...fday.hour);
    }
  }
  const nowEpoch = Math.floor(Date.now() / 1000);
  let startIdx = allHours.findIndex(h => h.time_epoch >= nowEpoch - 3600);
  if (startIdx === -1) startIdx = 0;

  const hourlySlice = allHours.slice(startIdx, startIdx + 48);
  const hourlyForecast = hourlySlice.map(h => {
    const d = new Date(h.time);
    const hour = d.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = `${hour % 12 || 12} ${ampm}`;
    return {
      time: formattedHour,
      hour,
      isoTime: h.time,
      temperature: Math.round(h.temp_c * 10) / 10,
      feelsLike: Math.round(h.feelslike_c * 10) / 10,
      humidity: Math.round(h.humidity),
      windSpeed: Math.round(h.wind_kph * 10) / 10,
      precipitation: h.precip_mm || 0,
      precipitationProbability: h.chance_of_rain || 0,
      uvIndex: h.uv || 0,
      condition: h.condition?.text || 'Clear',
      isPeak: hour >= 12 && hour <= 16
    };
  });

  // Daily forecast for up to 7 days
  const dailyForecast = forecastDays.map((fDay, i) => {
    const dObj = new Date(fDay.date + 'T00:00:00');
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateLabel = dObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return {
      day: dayLabel,
      date: dateLabel,
      isoDate: fDay.date,
      maxTemp: Math.round(fDay.day.maxtemp_c * 10) / 10,
      minTemp: Math.round(fDay.day.mintemp_c * 10) / 10,
      avgHumidity: Math.round(fDay.day.avghumidity),
      condition: fDay.day.condition?.text || 'Clear',
      conditionDescription: fDay.day.condition?.text || 'Pleasant weather',
      uvIndexMax: fDay.day.uv || 8,
      precipitationProbability: fDay.day.daily_chance_of_rain || 0,
      sunrise: fDay.astro?.sunrise || '06:00 AM',
      sunset: fDay.astro?.sunset || '06:30 PM'
    };
  });

  const approxSolarRad = cur.short_rad || Math.round(Math.max(0, (cur.uv || 5) * 90 * (1 - (cur.cloud || 20) / 100 * 0.75)));

  return {
    location: {
      name: data.location?.name || cityName,
      city: data.location?.name || cityName,
      district: data.location?.region || '',
      state: data.location?.region || '',
      region: data.location?.region || '',
      country: data.location?.country || '',
      lat: data.location?.lat ?? lat,
      lng: data.location?.lon ?? lon,
      latitude: data.location?.lat ?? lat,
      longitude: data.location?.lon ?? lon,
      timezone: data.location?.tz_id || 'UTC'
    },
    current: {
      temperature: Math.round(cur.temp_c * 10) / 10,
      feelsLike: Math.round(cur.feelslike_c * 10) / 10,
      humidity: Math.round(cur.humidity),
      windSpeed: Math.round(cur.wind_kph * 10) / 10,
      windDirection: cur.wind_degree,
      windDirectionCompass: cur.wind_dir || degreesToCompass(cur.wind_degree || 0),
      pressure: Math.round(cur.pressure_mb),
      condition: cur.condition?.text || 'Clear',
      conditionDescription: cur.condition?.text || 'Clear Sky',
      cloudCover: Math.round(cur.cloud || 0),
      visibility: Math.round((cur.vis_km || 10) * 10) / 10,
      precipitation: cur.precip_mm || 0,
      sunrise: astro0.sunrise || '05:55 AM',
      sunset: astro0.sunset || '06:15 PM',
      uvIndex: Math.round((cur.uv || 0) * 10) / 10,
      dewPoint: cur.dewpoint_c ?? Math.round((cur.temp_c - (100 - cur.humidity) / 5) * 10) / 10,
      solarRadiation: approxSolarRad,
      timestamp: cur.last_updated || new Date().toISOString(),
      updatedAt: 'Just now'
    },
    airQuality: {
      aqi: aqiVal,
      pm25: aqiRaw.pm2_5 ? Math.round(aqiRaw.pm2_5 * 10) / 10 : 28.4,
      pm10: aqiRaw.pm10 ? Math.round(aqiRaw.pm10 * 10) / 10 : 42.1,
      o3: aqiRaw.o3 ? Math.round(aqiRaw.o3 * 10) / 10 : 45.0,
      no2: aqiRaw.no2 ? Math.round(aqiRaw.no2 * 10) / 10 : 18.2,
      so2: aqiRaw.so2 ? Math.round(aqiRaw.so2 * 10) / 10 : 9.5,
      co: aqiRaw.co ? Math.round(aqiRaw.co) : 310,
      standard: 'US EPA Air Quality Index (AQI)',
      category: aqiCategoryInfo.category,
      advisory: aqiCategoryInfo.advisory
    },
    hourly: hourlyForecast,
    daily: dailyForecast,
    isLive: true,
    isCached: false,
    source: 'weatherapi',
    provider: 'WeatherAPI.com',
    updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * 1. GET /api/weather
 * Retrieves real weather + forecast + air quality telemetry
 */
apiRouter.get('/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || '16.5062');
    const lon = parseFloat(req.query.lon || '80.6480');
    const cityName = req.query.city || 'Vijayawada';

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
    }

    const cacheKey = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        isCached: true,
        source: 'cached'
      });
    }

    // Attempt 1: Query WeatherAPI.com with the user's active API key
    const weatherApiKey = (process.env.WEATHER_API_KEY || '').trim();
    if (weatherApiKey) {
      try {
        const liveWeatherApiData = await fetchFromWeatherApi(lat, lon, cityName, weatherApiKey);
        setInCache(cacheKey, liveWeatherApiData);
        return res.json(liveWeatherApiData);
      } catch (weatherApiError) {
        console.warn('[HeatGuard Backend] WeatherAPI query failed, falling back to Open-Meteo:', weatherApiError.message);
      }
    }

    // Attempt 2: Fallback to Open-Meteo High-Resolution Weather Model
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,dew_point_2m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=8`;

    // Step 2: Query Open-Meteo Real-Time Air Quality Model
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl, { headers: { 'User-Agent': 'HeatGuard-AI/2.0' } }),
      fetch(aqiUrl, { headers: { 'User-Agent': 'HeatGuard-AI/2.0' } })
    ]);

    if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
      throw new Error('Upstream meteorological telemetry provider failed to respond.');
    }

    const weatherData = await weatherRes.value.json();
    let aqiData = null;
    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      aqiData = await aqiRes.value.json();
    }

    const currentRaw = weatherData.current || {};
    const hourlyRaw = weatherData.hourly || {};
    const dailyRaw = weatherData.daily || {};
    const aqiCurrent = aqiData?.current || {};

    const wmoInfo = interpretWmoCode(currentRaw.weather_code || 0);

    // Current hour index in hourly array to extract UV and visibility
    const currentHourTime = currentRaw.time;
    let currentHourIndex = 0;
    if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
      const idx = hourlyRaw.time.findIndex(t => t.startsWith(currentHourTime?.slice(0, 13) || ''));
      if (idx !== -1) currentHourIndex = idx;
    }

    const currentUv = hourlyRaw.uv_index?.[currentHourIndex] ?? 7.5;
    const currentVisibilityMeters = hourlyRaw.visibility?.[currentHourIndex] ?? 10000;
    const currentDewPoint = hourlyRaw.dew_point_2m?.[currentHourIndex] ?? 
      Math.round((currentRaw.temperature_2m - (100 - currentRaw.relative_humidity_2m) / 5) * 10) / 10;

    // Approximate solar radiation in W/m² based on UV Index and cloud cover
    const cloudFraction = (currentRaw.cloud_cover || 20) / 100;
    const approxSolarRadiation = Math.round(Math.max(0, currentUv * 90 * (1 - cloudFraction * 0.75)));

    // Process Hourly Forecast (up to 48 hours)
    const hourlyForecast = [];
    if (hourlyRaw.time && Array.isArray(hourlyRaw.time)) {
      const startIndex = currentHourIndex;
      const hoursToTake = Math.min(48, hourlyRaw.time.length - startIndex);
      for (let i = 0; i < hoursToTake; i++) {
        const hIndex = startIndex + i;
        const timeStr = hourlyRaw.time[hIndex];
        const dateObj = new Date(timeStr);
        const hour = dateObj.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = (hour % 12 || 12) + ' ' + ampm;
        const wmo = interpretWmoCode(hourlyRaw.weather_code?.[hIndex] || 0);

        hourlyForecast.push({
          time: formattedHour,
          hour,
          isoTime: timeStr,
          temperature: Math.round(hourlyRaw.temperature_2m[hIndex] * 10) / 10,
          feelsLike: Math.round(hourlyRaw.apparent_temperature[hIndex] * 10) / 10,
          humidity: Math.round(hourlyRaw.relative_humidity_2m[hIndex]),
          windSpeed: Math.round(hourlyRaw.wind_speed_10m[hIndex] * 10) / 10,
          precipitation: hourlyRaw.precipitation?.[hIndex] || 0,
          precipitationProbability: hourlyRaw.precipitation_probability?.[hIndex] || 0,
          uvIndex: hourlyRaw.uv_index?.[hIndex] || 0,
          condition: wmo.condition,
          isPeak: hour >= 12 && hour <= 16
        });
      }
    }

    // Process 7-day Multi-Day Forecast
    const dailyForecast = [];
    if (dailyRaw.time && Array.isArray(dailyRaw.time)) {
      const daysCount = Math.min(7, dailyRaw.time.length);
      for (let i = 0; i < daysCount; i++) {
        const isoDate = dailyRaw.time[i];
        const dObj = new Date(isoDate);
        const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dateLabel = dObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const wmo = interpretWmoCode(dailyRaw.weather_code?.[i] || 0);

        // Daily average humidity approximation from corresponding hourly slice
        const dayStartIndex = i * 24;
        let avgHum = 55;
        if (hourlyRaw.relative_humidity_2m && hourlyRaw.relative_humidity_2m.length > dayStartIndex) {
          const slice = hourlyRaw.relative_humidity_2m.slice(dayStartIndex, dayStartIndex + 24);
          if (slice.length > 0) {
            avgHum = Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
          }
        }

        dailyForecast.push({
          day: dayLabel,
          date: dateLabel,
          isoDate,
          maxTemp: Math.round(dailyRaw.temperature_2m_max[i] * 10) / 10,
          minTemp: Math.round(dailyRaw.temperature_2m_min[i] * 10) / 10,
          avgHumidity: avgHum,
          condition: wmo.condition,
          conditionDescription: wmo.description,
          uvIndexMax: dailyRaw.uv_index_max?.[i] || 8,
          precipitationProbability: dailyRaw.precipitation_probability_max?.[i] || 0,
          sunrise: dailyRaw.sunrise?.[i] || '',
          sunset: dailyRaw.sunset?.[i] || ''
        });
      }
    }

    const aqiVal = Math.round(aqiCurrent.us_aqi || 65);
    const aqiCategoryInfo = getAqiCategory(aqiVal);

    const normalizedResponse = {
      location: {
        name: cityName,
        lat,
        lng: lon
      },
      current: {
        temperature: Math.round(currentRaw.temperature_2m * 10) / 10,
        feelsLike: Math.round(currentRaw.apparent_temperature * 10) / 10,
        humidity: Math.round(currentRaw.relative_humidity_2m),
        windSpeed: Math.round(currentRaw.wind_speed_10m * 10) / 10,
        windDirection: currentRaw.wind_direction_10m,
        windDirectionCompass: degreesToCompass(currentRaw.wind_direction_10m || 0),
        pressure: Math.round(currentRaw.surface_pressure),
        condition: wmoInfo.condition,
        conditionDescription: wmoInfo.description,
        cloudCover: Math.round(currentRaw.cloud_cover || 0),
        visibility: Math.round((currentVisibilityMeters / 1000) * 10) / 10,
        precipitation: currentRaw.precipitation || 0,
        sunrise: dailyRaw.sunrise?.[0] || '',
        sunset: dailyRaw.sunset?.[0] || '',
        uvIndex: Math.round(currentUv * 10) / 10,
        dewPoint: currentDewPoint,
        solarRadiation: approxSolarRadiation,
        timestamp: currentRaw.time || new Date().toISOString(),
        updatedAt: 'Just now'
      },
      airQuality: {
        aqi: aqiVal,
        pm25: aqiCurrent.pm2_5 ? Math.round(aqiCurrent.pm2_5 * 10) / 10 : 28.4,
        pm10: aqiCurrent.pm10 ? Math.round(aqiCurrent.pm10 * 10) / 10 : 42.1,
        o3: aqiCurrent.ozone ? Math.round(aqiCurrent.ozone * 10) / 10 : 45.0,
        no2: aqiCurrent.nitrogen_dioxide ? Math.round(aqiCurrent.nitrogen_dioxide * 10) / 10 : 18.2,
        so2: aqiCurrent.sulphur_dioxide ? Math.round(aqiCurrent.sulphur_dioxide * 10) / 10 : 9.5,
        co: aqiCurrent.carbon_monoxide ? Math.round(aqiCurrent.carbon_monoxide) : 310,
        standard: 'US EPA Air Quality Index (AQI)',
        category: aqiCategoryInfo.category,
        advisory: aqiCategoryInfo.advisory
      },
      hourly: hourlyForecast,
      daily: dailyForecast,
      isLive: true,
      isCached: false,
      source: 'live',
      updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setInCache(cacheKey, normalizedResponse);
    return res.json(normalizedResponse);
  } catch (error) {
    console.error('API Error in /api/weather:', error.message);
    return res.status(502).json({
      error: 'Unable to retrieve current weather data. Please try again.',
      details: error.message
    });
  }
});

/**
 * 2. GET /api/geocode/reverse
 * Reverse-geocodes browser geolocation coordinates into readable city, district, state
 */
apiRouter.get('/geocode/reverse', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
    }

    const cacheKey = `geo_rev_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    const weatherApiKey = (process.env.WEATHER_API_KEY || '').trim();
    if (weatherApiKey) {
      try {
        const wApiSearchUrl = `https://api.weatherapi.com/v1/search.json?key=${weatherApiKey}&q=${lat},${lon}`;
        const wRes = await fetch(wApiSearchUrl, { headers: { 'User-Agent': 'HeatGuard-AI/2.0' } });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (Array.isArray(wData) && wData.length > 0) {
            const r = wData[0];
            const displayName = `${r.name}${r.region ? `, ${r.region}` : ''}${r.country ? `, ${r.country}` : ''}`;
            const result = {
              id: String(r.id || `${r.name.toLowerCase().replace(/\s+/g, '-')}-${r.lat}-${r.lon}`),
              name: r.name,
              city: r.name,
              district: r.region || '',
              state: r.region || '',
              region: r.region || '',
              country: r.country || 'India',
              lat: r.lat,
              lng: r.lon,
              latitude: r.lat,
              longitude: r.lon,
              displayName
            };
            setInCache(cacheKey, result);
            return res.json(result);
          }
        }
      } catch (wErr) {
        console.warn('[HeatGuard Backend] WeatherAPI reverse geocode failed, falling back to Nominatim:', wErr.message);
      }
    }

    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(geoUrl, {
      headers: { 'User-Agent': 'HeatGuard-AI/2.0 (Public Safety Disaster Modeling)' }
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Detected Location';
    const district = addr.state_district || addr.county || addr.district || '';
    const state = addr.state || '';
    const country = addr.country || 'India';
    const displayName = `${cityName}${district ? `, ${district}` : ''}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}`;

    const result = {
      id: `geo-${lat.toFixed(3)}-${lon.toFixed(3)}`,
      name: cityName,
      city: cityName,
      district,
      state,
      region: state || district,
      country,
      lat,
      lng: lon,
      latitude: lat,
      longitude: lon,
      displayName
    };

    setInCache(cacheKey, result);
    return res.json(result);
  } catch (error) {
    console.error('Reverse Geocode Error:', error.message);
    return res.status(500).json({
      error: 'Failed to reverse-geocode coordinates',
      details: error.message
    });
  }
});

/**
 * 3. GET /api/geocode/search
 * Search for any city in India or globally
 */
apiRouter.get('/geocode/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json({ results: [] });
    }

    const cacheKey = `geo_search_${query.toLowerCase()}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json({ results: cached });

    const weatherApiKey = (process.env.WEATHER_API_KEY || '').trim();
    if (weatherApiKey) {
      try {
        const wSearchUrl = `https://api.weatherapi.com/v1/search.json?key=${weatherApiKey}&q=${encodeURIComponent(query)}`;
        const wRes = await fetch(wSearchUrl, { headers: { 'User-Agent': 'HeatGuard-AI/2.0' } });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (Array.isArray(wData) && wData.length > 0) {
            const results = wData.map(r => {
              const displayName = `${r.name}${r.region ? `, ${r.region}` : ''}${r.country ? `, ${r.country}` : ''}`;
              return {
                id: String(r.id || `${r.name.toLowerCase().replace(/\s+/g, '-')}-${r.lat}-${r.lon}`),
                name: r.name,
                city: r.name,
                district: r.region || '',
                state: r.region || '',
                region: r.region || '',
                country: r.country || '',
                lat: r.lat,
                lng: r.lon,
                latitude: r.lat,
                longitude: r.lon,
                displayName,
                url: r.url || '',
                elevation: 0
              };
            });
            setInCache(cacheKey, results);
            return res.json({ results });
          }
        }
      } catch (wErr) {
        console.warn('[HeatGuard Backend] WeatherAPI geocode search failed, falling back to Open-Meteo:', wErr.message);
      }
    }

    const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'HeatGuard-AI/2.0' }
    });

    if (!response.ok) {
      throw new Error('Geocoding search provider failed.');
    }

    const data = await response.json();
    const results = (data.results || []).map(r => {
      const region = r.admin1 || r.admin2 || '';
      const country = r.country || '';
      const displayName = `${r.name}${region ? `, ${region}` : ''}${country ? `, ${country}` : ''}`;
      return {
        id: `${r.name.toLowerCase().replace(/\s+/g, '-')}-${r.id}`,
        name: r.name,
        city: r.name,
        district: r.admin2 || r.admin3 || '',
        state: r.admin1 || '',
        region,
        country,
        lat: r.latitude,
        lng: r.longitude,
        latitude: r.latitude,
        longitude: r.longitude,
        displayName,
        elevation: r.elevation || 0
      };
    });

    setInCache(cacheKey, results);
    return res.json({ results });
  } catch (error) {
    console.error('Geocode search error:', error.message);
    return res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

/**
 * 4. GET /api/historical
 * Retrieves real historical weather observations for 7 or 30 days
 */
apiRouter.get('/historical', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat || '16.5062');
    const lon = parseFloat(req.query.lon || '80.6480');
    const days = parseInt(req.query.days || '7', 10);

    const cacheKey = `hist_${lat.toFixed(3)}_${lon.toFixed(3)}_${days}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - 1); // Yesterday

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const histUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startStr}&end_date=${endStr}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean&timezone=auto`;

    const response = await fetch(histUrl, {
      headers: { 'User-Agent': 'HeatGuard-AI/2.0' }
    });

    if (!response.ok) {
      throw new Error('Historical archive provider failed.');
    }

    const data = await response.json();
    const daily = data.daily || {};
    const history = [];

    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 0; i < daily.time.length; i++) {
        const dStr = daily.time[i];
        const dateObj = new Date(dStr);
        const maxTemp = Math.round(daily.temperature_2m_max[i] * 10) / 10;
        const minTemp = Math.round(daily.temperature_2m_min[i] * 10) / 10;
        const avgTemp = Math.round(daily.temperature_2m_mean[i] * 10) / 10;
        const humidity = Math.round(daily.relative_humidity_2m_mean[i]);

        history.push({
          date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isoDate: dStr,
          maxTemp,
          minTemp,
          avgTemp,
          humidity
        });
      }
    }

    const payload = { history };
    setInCache(cacheKey, payload);
    return res.json(payload);
  } catch (error) {
    console.error('Historical data error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch historical telemetry', details: error.message });
  }
});

/**
 * 5. GET /api/health
 * Health check endpoint required by deployment specifications
 */
apiRouter.get('/health', (req, res) => {
  const hasKey = Boolean(process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY.trim());
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.json({
    status: 'ok',
    backend: 'connected',
    service: 'HeatGuard AI Telemetry & Auth Gateway',
    timestamp: new Date().toISOString(),
    cacheEntries: cache.size,
    provider: hasKey ? 'WeatherAPI.com (Key Active)' : (process.env.WEATHER_API_PROVIDER || 'openmeteo'),
    activeKey: hasKey,
    environment: process.env.VERCEL ? 'vercel-serverless' : (process.env.NODE_ENV || 'production')
  });
});

// --- AUTHENTICATION & USER MANAGEMENT API ---

function requireAuth(req, res, next) {
  const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  const session = db.findSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }
  req.user = user;
  req.session = session;
  next();
}

/**
 * POST /api/auth/signup
 */
apiRouter.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, location, userCategory, password, confirmPassword } = req.body || {};

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Please fill in all required registration fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        error: 'Password must include at least one uppercase letter, one lowercase letter, and one number.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      name,
      email,
      phone,
      location,
      userCategory,
      passwordHash
    });

    const session = db.createSession(newUser.id);
    res.cookie('heatguard_session', session.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ user: db.sanitizeUser(newUser), token: session.sessionId });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Failed to process account registration.' });
  }
});

/**
 * POST /api/auth/login
 */
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const rateCheck = db.checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.'
      });
    }

    if (!email || !password || !email.trim() || !password.trim()) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      db.recordFailedLogin(clientIp);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      db.recordFailedLogin(clientIp);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    db.clearFailedLogins(clientIp);

    const session = db.createSession(user.id);
    res.cookie('heatguard_session', session.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ user: db.sanitizeUser(user), token: session.sessionId });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication processing failed.' });
  }
});

/**
 * GET /api/auth/me
 */
apiRouter.get('/auth/me', (req, res) => {
  const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const session = db.findSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  return res.json({ user: db.sanitizeUser(user) });
});

/**
 * POST /api/auth/logout
 */
apiRouter.post('/auth/logout', (req, res) => {
  const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    db.deleteSession(sessionId);
  }
  res.clearCookie('heatguard_session', { path: '/' });
  return res.json({ message: 'Successfully logged out' });
});

/**
 * POST /api/auth/forgot-password
 */
apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body || {};
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }

  const user = db.findUserByEmail(email);
  let resetToken = null;
  if (user) {
    resetToken = db.setResetToken(user.id);
  }

  return res.json({
    message: 'If an account with that email exists, password reset instructions have been generated.',
    resetToken: resetToken || undefined
  });
});

/**
 * POST /api/auth/reset-password
 */
apiRouter.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};
    if (!token) {
      return res.status(400).json({ error: 'Reset token is required.' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must contain at least 8 characters.' });
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must include at least one uppercase letter, one lowercase letter, and one number.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const user = db.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    db.updateUser(user.id, { passwordHash, resetToken: null, resetTokenExpires: null });
    return res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

/**
 * PUT /api/user/profile
 */
apiRouter.put('/user/profile', requireAuth, (req, res) => {
  try {
    const allowedUpdates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,
      userCategory: req.body.userCategory,
      notificationPreferences: req.body.notificationPreferences,
      emergencyContacts: req.body.emergencyContacts
    };

    Object.keys(allowedUpdates).forEach(
      k => allowedUpdates[k] === undefined && delete allowedUpdates[k]
    );

    const updated = db.updateUser(req.user.id, allowedUpdates);
    return res.json({ user: db.sanitizeUser(updated) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * PUT /api/user/onboarding
 */
apiRouter.put('/user/onboarding', requireAuth, (req, res) => {
  try {
    const updated = db.updateUser(req.user.id, { onboarded: true });
    return res.json({ user: db.sanitizeUser(updated) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
});

/**
 * GET /api/user/searches
 * Retrieves previously searched locations from database
 */
apiRouter.get('/user/searches', (req, res) => {
  try {
    const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
    const session = sessionId ? db.findSession(sessionId) : null;
    const userId = session ? session.userId : null;
    const searches = db.getSearches(userId);
    return res.json({ searches });
  } catch (err) {
    console.error('Failed to get searches:', err);
    return res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

/**
 * POST /api/user/searches
 * Stores a newly searched location in the database
 */
apiRouter.post('/user/searches', (req, res) => {
  try {
    const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
    const session = sessionId ? db.findSession(sessionId) : null;
    const userId = session ? session.userId : null;
    const location = req.body || {};
    if (!location.name) {
      return res.status(400).json({ error: 'Location name is required' });
    }
    const updated = db.addSearch(userId, location);
    return res.status(201).json({ success: true, searches: updated });
  } catch (err) {
    console.error('Failed to record search:', err);
    return res.status(500).json({ error: 'Failed to save search history' });
  }
});

/**
 * DELETE /user/searches and DELETE /user/searches/:id
 * Clears or removes an entry from search history in database
 */
apiRouter.delete('/user/searches', (req, res) => {
  try {
    const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
    const session = sessionId ? db.findSession(sessionId) : null;
    const userId = session ? session.userId : null;
    const updated = db.clearSearches(userId);
    return res.json({ success: true, searches: updated });
  } catch (err) {
    console.error('Failed to clear searches:', err);
    return res.status(500).json({ error: 'Failed to delete search history' });
  }
});

apiRouter.delete('/user/searches/:id', (req, res) => {
  try {
    const sessionId = req.cookies.heatguard_session || req.headers.authorization?.replace('Bearer ', '');
    const session = sessionId ? db.findSession(sessionId) : null;
    const userId = session ? session.userId : null;
    const searchId = req.params.id;
    const updated = db.deleteSearch(userId, searchId);
    return res.json({ success: true, searches: updated });
  } catch (err) {
    console.error('Failed to delete search:', err);
    return res.status(500).json({ error: 'Failed to delete search history' });
  }
});

// Mount the API router on both '/api' and '/'
// This guarantees requests reach the endpoints whether Vercel rewrites preserve '/api' or strip it
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve production build assets from dist if available (only in standalone Node mode)
const distPath = path.resolve(__dirname, '../dist');
if (!process.env.VERCEL) {
  try {
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get(/^(?!\/api).+/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } catch {
    // Ignore static serving fallback error
  }
}

// Only bind port when executed directly (e.g. `node server/index.js`), not when imported
const isDirectRun = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server/index.js') ||
   process.argv[1].endsWith('server\\index.js'))
);

if (!process.env.VERCEL && isDirectRun) {
  app.listen(PORT, () => {
    console.log(`[HeatGuard Backend] Telemetry API & Auth Gateway running on http://localhost:${PORT}`);
  });
  setInterval(() => {}, 1000 * 60 * 60);
}

export default app;
export { app };


import { AlertItem, WeatherMetrics, HourlyHeatRisk, DailyHeatForecast, AirQualityMetrics } from '../types';

const STORAGE_KEY_READ_ALERTS = 'heatguard_read_alert_ids';

export const alertService = {
  getReadAlertIds(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_READ_ALERTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  },

  setReadAlertId(id: string): void {
    const ids = this.getReadAlertIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(STORAGE_KEY_READ_ALERTS, JSON.stringify(ids));
    }
  },

  setAllReadAlertIds(ids: string[]): void {
    localStorage.setItem(STORAGE_KEY_READ_ALERTS, JSON.stringify(ids));
  },

  /**
   * Generates real dynamic alerts based on actual meteorological thresholds
   */
  generateAlertsFromTelemetry(
    weather: WeatherMetrics,
    hourly: HourlyHeatRisk[],
    daily: DailyHeatForecast[],
    airQuality?: AirQualityMetrics,
    locationName: string = 'Current Location'
  ): AlertItem[] {
    const alerts: AlertItem[] = [];
    const readIds = this.getReadAlertIds();
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // 1. Extreme Temperature Threshold Alert (Temp >= 40°C or daily max >= 42°C)
    if (weather.temperature >= 40 || (daily[0] && daily[0].maxTemp >= 42)) {
      const isExtreme = weather.temperature >= 43 || (daily[0] && daily[0].maxTemp >= 44);
      const id = `alert-temp-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
      alerts.push({
        id,
        type: 'critical',
        severity: isExtreme ? 'extreme' : 'high',
        title: isExtreme ? '🚨 Severe Heatwave Warning (Red Alert)' : '⚠️ High Ambient Temperature Alert',
        message: `Surface air temperature has reached ${weather.temperature}°C with daily peak projected at ${daily[0]?.maxTemp || weather.temperature}°C (Threshold: >= 40°C) across ${locationName}. Severe physiological strain anticipated.`,
        timestamp: nowTimeStr,
        location: locationName,
        actualValue: `${weather.temperature}°C`,
        threshold: '>= 40.0°C',
        recommendedAction: 'Move to air-conditioned cooling shelters immediately. Prohibit non-essential outdoor manual labor.',
        actionLabel: 'Emergency Protocol',
        actionUrl: '/emergency',
        isRead: readIds.includes(id)
      });
    }

    // 2. High Heat Index / Thermal Stress Alert (Feels Like >= 41°C)
    if (weather.feelsLike >= 41) {
      const isExtreme = weather.feelsLike >= 46;
      const id = `alert-feelslike-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
      alerts.push({
        id,
        type: 'heatwave',
        severity: isExtreme ? 'extreme' : 'high',
        title: '🔥 Critical Heat Index & Thermal Stress Alert',
        message: `Apparent Heat Index has elevated to ${weather.feelsLike}°C (Dry bulb: ${weather.temperature}°C, Humidity: ${weather.humidity}%). At this thermal level, sweat cannot evaporate efficiently to regulate body temperature.`,
        timestamp: nowTimeStr,
        location: locationName,
        actualValue: `${weather.feelsLike}°C (Feels-like)`,
        threshold: '>= 41.0°C Heat Index',
        recommendedAction: 'Drink cool water and electrolyte solutions every 15–20 minutes. Avoid direct sun exposure during peak solar azimuth.',
        actionLabel: 'Check Personal Risk',
        actionUrl: '/thermal-stress',
        isRead: readIds.includes(id)
      });
    }

    // 3. High Humidity + High Temperature Compound Risk (Temp >= 34°C and Humidity >= 65%)
    if (weather.temperature >= 34 && weather.humidity >= 65) {
      const id = `alert-wetbulb-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
      alerts.push({
        id,
        type: 'heatwave',
        severity: 'high',
        title: '💧 Oppressive Moisture & Evaporative Failure Advisory',
        message: `Simultaneous elevated temperature (${weather.temperature}°C) and high relative humidity (${weather.humidity}%) create an oppressive vapor barrier, severely diminishing the body's natural evaporative cooling.`,
        timestamp: nowTimeStr,
        location: locationName,
        actualValue: `${weather.temperature}°C at ${weather.humidity}% RH`,
        threshold: 'Temp >= 34°C & RH >= 65%',
        recommendedAction: 'Utilize active cross-ventilation, misting fans, and damp towels. Restrict strenuous physical exertion.',
        actionLabel: 'Safety Guide',
        actionUrl: '/safety',
        isRead: readIds.includes(id)
      });
    }

    // 4. Dangerous Nighttime Temperature (Daily minTemp >= 27°C)
    const minNightTemp = daily[0]?.minTemp ?? 0;
    if (minNightTemp >= 27) {
      const id = `alert-night-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
      alerts.push({
        id,
        type: 'safety',
        severity: 'moderate',
        title: '🌙 Elevated Nighttime Temperature Advisory',
        message: `Forecasted overnight minimum is ${minNightTemp}°C (Threshold: >= 27°C). Nighttime heat retention prevents core temperature recovery, increasing cumulative heat stroke risk for vulnerable demographics.`,
        timestamp: nowTimeStr,
        location: locationName,
        actualValue: `${minNightTemp}°C overnight minimum`,
        threshold: 'Nighttime Min >= 27.0°C',
        recommendedAction: 'Cool indoor living spaces in the late evening. Drink fluids before sleep and monitor elderly family members.',
        actionLabel: 'Safety Guide',
        actionUrl: '/safety',
        isRead: readIds.includes(id)
      });
    }

    // 5. Rapid Diurnal Temperature Ramp Detection
    if (hourly && hourly.length >= 6) {
      const peakDay = hourly.slice(0, 10);
      const temps = peakDay.map(h => h.temperature);
      const minEarly = Math.min(...temps.slice(0, 4));
      const maxMid = Math.max(...temps.slice(3, 8));
      if (maxMid - minEarly >= 4.5) {
        const id = `alert-spike-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
        alerts.push({
          id,
          type: 'heatwave',
          severity: 'moderate',
          title: '⚡ Rapid Diurnal Heat Spike Detected',
          message: `Atmospheric telemetry indicates a steep diurnal ramp of +${(maxMid - minEarly).toFixed(1)}°C between early morning and peak midday azimuth. Rapid thermal acceleration increases acute cardiac strain.`,
          timestamp: nowTimeStr,
          location: locationName,
          actualValue: `+${(maxMid - minEarly).toFixed(1)}°C spike`,
          threshold: '>= +4.0°C rise within 4h',
          recommendedAction: 'Complete outdoor tasks prior to 11:00 AM before rapid thermal buildup takes effect.',
          actionLabel: 'View Diurnal Timeline',
          actionUrl: '/dashboard',
          isRead: readIds.includes(id)
        });
      }
    }

    // 6. Excessive UV Radiation Alert (UV Index >= 8)
    if (weather.uvIndex >= 8) {
      const id = `alert-uv-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
      alerts.push({
        id,
        type: 'safety',
        severity: weather.uvIndex >= 10 ? 'high' : 'moderate',
        title: `☀️ High Solar UV Index (${weather.uvIndex} / 12)`,
        message: `Extreme solar ultraviolet irradiance detected. Direct unshielded skin exposure may cause epidermal burns within 15–20 minutes and exacerbate core thermal gain.`,
        timestamp: nowTimeStr,
        location: locationName,
        actualValue: `UV Index ${weather.uvIndex}`,
        threshold: 'UV Index >= 8.0',
        recommendedAction: 'Apply SPF 30+ broad-spectrum sunscreen, wear UV-protective eyewear, and seek shaded corridors.',
        actionLabel: 'Safety Guide',
        actionUrl: '/safety',
        isRead: readIds.includes(id)
      });
    }

    // 7. Hazardous Air Quality Alert (AQI >= 130)
    if (airQuality && airQuality.aqi >= 130) {
      const id = `alert-aqi-${locationName.toLowerCase().replace(/\s+/g, '-')}`;
      alerts.push({
        id,
        type: 'safety',
        severity: airQuality.aqi >= 200 ? 'extreme' : 'high',
        title: `😷 Poor Air Quality Advisory (${airQuality.category})`,
        message: `Real-time Air Quality Index elevated at ${airQuality.aqi} (${airQuality.standard}). High concentrations of PM2.5 (${airQuality.pm25} µg/m³) compound with ambient heat to create severe cardio-pulmonary distress.`,
        timestamp: nowTimeStr,
        location: locationName,
        actualValue: `AQI ${airQuality.aqi} (PM2.5: ${airQuality.pm25} µg/m³)`,
        threshold: 'AQI >= 130',
        recommendedAction: 'Limit strenuous outdoor workouts. Wear an N95 particulate mask if outdoors.',
        actionLabel: 'Safety Guide',
        actionUrl: '/safety',
        isRead: readIds.includes(id)
      });
    }

    return alerts;
  }
};

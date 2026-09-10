import { RiskLevel } from '../types';

/**
 * ==============================================================================
 * HeatGuard Biometeorological & Human Thermal Stress Calculation Engine
 * ==============================================================================
 * 
 * Scientific Basis & Meteorological Citations:
 * 1. NOAA / National Weather Service (NWS) Heat Index Equation:
 *    - Formulation: Lans P. Rothfusz (1990), based on Robert G. Steadman (1979)
 *      "The Assessment of Human Biometeorology", Journal of Applied Meteorology.
 * 2. Australian Bureau of Meteorology (BOM) Apparent Temperature (AT):
 *    - Steadman formulation incorporating water vapor pressure and wind velocity.
 * 3. World Meteorological Organization (WMO) & India Meteorological Department (IMD)
 *    Standardized Heatwave and Thermal Risk Thresholds:
 *    - Low: < 27°C Apparent Temp (Comfortable / Normal physiological range)
 *    - Moderate: 27°C – 32°C (Caution: fatigue possible with prolonged exposure)
 *    - High: 32°C – 39°C (Extreme Caution: heat cramps & heat exhaustion possible)
 *    - Very High: 39°C – 51°C (Danger: heat exhaustion likely, cramps imminent)
 *    - Extreme: >= 51°C (Extreme Danger: heat stroke imminent with continued exposure)
 * ==============================================================================
 */

export interface WeatherDataInput {
  temperature: number; // Dry bulb temp in °C
  humidity: number;    // Relative humidity in %
  windSpeed?: number;  // Wind speed in km/h
  uvIndex?: number;    // UV index (0-12+)
  solarRadiation?: number; // W/m²
}

export interface ContributingFactor {
  name: string;
  impact: string;
  weight: number; // 0 - 100 percentage bar
  color: string;
}

export interface HeatStressResult {
  score: number; // 0-100 normalized thermal stress score
  heatIndexCelsius: number;
  apparentTempCelsius: number;
  riskCategory: RiskLevel;
  severity: 'info' | 'moderate' | 'high' | 'extreme';
  explanation: string;
  recommendedAction: string;
  contributingFactors: ContributingFactor[];
}

/**
 * Compute NOAA Rothfusz Heat Index in Celsius
 * @param tempC Dry bulb temperature in Celsius
 * @param rh Relative humidity (0 - 100%)
 */
export function calculateNoaaHeatIndex(tempC: number, rh: number): number {
  const tF = tempC * 1.8 + 32;

  // For low temperatures where heat index is negligible
  if (tF < 70) {
    return tempC;
  }

  // Simple Steadman formula test
  let hiF = 0.5 * (tF + 61.0 + ((tF - 68.0) * 1.2) + (rh * 0.094));

  // If heat index is 80°F or higher, compute full Rothfusz regression equation
  if (hiF >= 80) {
    hiF =
      -42.379 +
      2.04901523 * tF +
      10.14333127 * rh -
      0.22475541 * tF * rh -
      0.00683783 * tF * tF -
      0.05481717 * rh * rh +
      0.00122874 * tF * tF * rh +
      0.00085282 * tF * rh * rh -
      0.00000199 * tF * tF * rh * rh;

    // Adjustment for low relative humidity
    if (rh < 13 && tF >= 80 && tF <= 112) {
      const adj = ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tF - 95)) / 17);
      hiF -= adj;
    }
    // Adjustment for high relative humidity
    else if (rh > 85 && tF >= 80 && tF <= 87) {
      const adj = ((rh - 85) / 10) * ((87 - tF) / 5);
      hiF += adj;
    }
  }

  const hiC = (hiF - 32) / 1.8;
  return Math.round(hiC * 10) / 10;
}

/**
 * Compute Steadman Apparent Temperature incorporating wind & vapor pressure
 */
export function calculateApparentTemperature(tempC: number, rh: number, windKmH: number = 10): number {
  const v = windKmH / 3.6; // Convert km/h to m/s
  // Vapor pressure e in hPa (Tetens formula)
  const e = (rh / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  // Steadman formulation
  const at = tempC + 0.33 * e - 0.70 * v - 4.0;
  return Math.round(at * 10) / 10;
}

/**
 * Main Scientific Heat Stress Calculation Service: calculateHeatStress
 * Separates: RAW WEATHER DATA -> DERIVED THERMAL INDEX -> HEAT RISK LEVEL
 */
export function calculateHeatStress(weather: WeatherDataInput): HeatStressResult {
  const {
    temperature,
    humidity,
    windSpeed = 10,
    uvIndex = 6,
    solarRadiation = 600
  } = weather;

  // 1. RAW METEOROLOGICAL DERIVATION
  const heatIndexC = calculateNoaaHeatIndex(temperature, humidity);
  const apparentTempC = calculateApparentTemperature(temperature, humidity, windSpeed);

  // 2. COMPOSITE HUMAN THERMAL STRESS SCORE (HTSS 0 - 100)
  // Maps standard NOAA/WMO heat hazard zones:
  // <27°C: 0-25 (Low)
  // 27-32°C: 26-45 (Moderate)
  // 32-39°C: 46-65 (High)
  // 39-51°C: 66-82 (Very High)
  // >=51°C: 83-100 (Extreme)
  let normalizedScore = 20;

  if (heatIndexC < 27) {
    normalizedScore = Math.max(5, Math.round(((heatIndexC - 15) / 12) * 20 + 5));
  } else if (heatIndexC < 32) {
    normalizedScore = Math.round(26 + ((heatIndexC - 27) / 5) * 19);
  } else if (heatIndexC < 39) {
    normalizedScore = Math.round(46 + ((heatIndexC - 32) / 7) * 19);
  } else if (heatIndexC < 51) {
    normalizedScore = Math.round(66 + ((heatIndexC - 39) / 12) * 16);
  } else {
    normalizedScore = Math.min(100, Math.round(83 + Math.min(17, (heatIndexC - 51) * 2.2)));
  }

  // Factor in solar radiation and wind modulation
  if (uvIndex >= 8) {
    normalizedScore = Math.min(100, normalizedScore + Math.round((uvIndex - 7) * 1.5));
  }
  if (windSpeed > 15 && temperature < 37) {
    // Evaporative wind cooling relief
    normalizedScore = Math.max(5, normalizedScore - Math.min(5, Math.round((windSpeed - 15) * 0.2)));
  } else if (windSpeed > 15 && temperature >= 40) {
    // Convective heat advection (hot wind acts like blast furnace)
    normalizedScore = Math.min(100, normalizedScore + Math.min(4, Math.round((windSpeed - 15) * 0.15)));
  }

  // 3. RISK LEVEL CLASSIFICATION
  let riskCategory: RiskLevel = 'Low';
  let severity: HeatStressResult['severity'] = 'info';
  let explanation = '';
  let recommendedAction = '';

  if (normalizedScore <= 25) {
    riskCategory = 'Low';
    severity = 'info';
    explanation = `Thermal conditions in your area are currently within comfortable physiological limits. Ambient dry bulb temperature is ${temperature}°C with ${humidity}% humidity.`;
    recommendedAction = 'Maintain standard baseline hydration of 1.5–2 liters per day. Normal outdoor physical activities are safe.';
  } else if (normalizedScore <= 45) {
    riskCategory = 'Moderate';
    severity = 'moderate';
    explanation = `Elevated thermal warmth detected (Heat Index: ${heatIndexC}°C). Prolonged strenuous physical labor under direct sunlight may induce fatigue and mild dehydration.`;
    recommendedAction = 'Ensure regular hydration intervals (250ml every 45 minutes). Take periodic shaded rests during peak midday hours.';
  } else if (normalizedScore <= 65) {
    riskCategory = 'High';
    severity = 'high';
    explanation = `High atmospheric thermal stress active. Humidity (${humidity}%) restricts perspiration evaporation, raising body core temperature during activity.`;
    recommendedAction = 'Wear light, loose-fitting cotton clothing and a wide-brim hat. Schedule strenuous outdoor work before 11:00 AM or after 4:00 PM.';
  } else if (normalizedScore <= 82) {
    riskCategory = 'Very High';
    severity = 'high';
    explanation = `Critical dangerous heat stress. Heat index of ${heatIndexC}°C creates high probability of heat cramps, exhaustion, and dizziness with extended outdoor exposure.`;
    recommendedAction = 'Limit direct sun exposure. Outdoor workers should adopt a 20-minute rest-per-hour ratio in cool shaded areas with electrolyte hydration.';
  } else {
    riskCategory = 'Extreme';
    severity = 'extreme';
    explanation = `EXTREME HEATWAVE EMERGENCY. Oppressive apparent temperature (${heatIndexC}°C) exceeds safe human thermoregulatory limits. Heat stroke is highly imminent.`;
    recommendedAction = 'Cease non-essential outdoor physical exertion immediately. Move vulnerable individuals to cooled shelters. Drink water and oral rehydration solutions.';
  }

  // 4. FACTOR ATTRIBUTION WEIGHTS
  const tempWeight = Math.min(98, Math.max(10, Math.round((temperature / 50) * 100)));
  const humWeight = Math.min(95, Math.max(15, Math.round(humidity)));
  const uvWeight = Math.min(99, Math.max(10, Math.round((uvIndex / 12) * 100)));
  const windRelief = windSpeed > 15 ? (temperature >= 40 ? 'Advective Heat Burden' : 'Cooling Wind Relief') : 'Calm Wind';

  const contributingFactors: ContributingFactor[] = [
    {
      name: 'Ambient Temperature',
      impact: `${temperature}°C (${tempWeight >= 80 ? 'Severe' : tempWeight >= 60 ? 'Elevated' : 'Moderate'})`,
      weight: tempWeight,
      color: tempWeight >= 80 ? 'bg-red-500' : 'bg-orange-500'
    },
    {
      name: 'Moisture Saturation (RH)',
      impact: `${humidity}% (${humidity >= 65 ? 'Inhibits Sweating' : 'Moderate Evaporation'})`,
      weight: humWeight,
      color: humidity >= 65 ? 'bg-orange-500' : 'bg-blue-500'
    },
    {
      name: 'Solar & UV Radiation',
      impact: `Index ${uvIndex} / 12 (${uvIndex >= 8 ? 'Very High UV' : 'Moderate UV'})`,
      weight: uvWeight,
      color: uvWeight >= 70 ? 'bg-amber-500' : 'bg-yellow-500'
    },
    {
      name: 'Advective Wind Dynamics',
      impact: `${windSpeed} km/h (${windRelief})`,
      weight: Math.min(85, Math.max(20, Math.round((windSpeed / 40) * 100))),
      color: 'bg-teal-500'
    }
  ];

  return {
    score: normalizedScore,
    heatIndexCelsius: heatIndexC,
    apparentTempCelsius: apparentTempC,
    riskCategory,
    severity,
    explanation,
    recommendedAction,
    contributingFactors
  };
}

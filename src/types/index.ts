export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';

export type UserCategory =
  | 'General Public'
  | 'Student'
  | 'Outdoor Worker'
  | 'Farmer'
  | 'Elderly'
  | 'Delivery Agent'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  userCategory: UserCategory;
  avatarUrl?: string;
  onboarded?: boolean;
  createdAt: string;
  notificationPreferences: {
    heatwaveWarnings: boolean;
    extremeAlerts: boolean;
    thermalStressAlerts: boolean;
    dailySummary: boolean;
    peakHourReminders: boolean;
  };
  emergencyContacts?: {
    name: string;
    phone: string;
    relation: string;
  }[];
}

export interface CityLocation {
  id: string;
  name: string;
  city?: string;
  district: string;
  state: string;
  region?: string;
  country?: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  displayName?: string;
  baseTemp: number;
  baseHumidity: number;
  riskLevel: RiskLevel;
  thermalStressScore: number;
  elevationMeters?: number;
}

export interface AirQualityMetrics {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  standard: string;
  category: string;
  advisory: string;
}

export interface WeatherMetrics {
  temperature: number; // in °C
  humidity: number; // in %
  feelsLike: number; // in °C
  windSpeed: number; // in km/h
  windDirection?: number;
  windDirectionCompass?: string;
  uvIndex: number;
  dewPoint: number; // in °C
  visibility: number; // in km
  pressure: number; // in hPa
  solarRadiation: number; // in W/m²
  cloudCover?: number;
  precipitation?: number;
  condition?: string;
  conditionDescription?: string;
  sunrise?: string;
  sunset?: string;
  timestamp?: string;
  updatedAt: string;
  isLive?: boolean;
  isCached?: boolean;
  provider?: string;
}

export interface HourlyHeatRisk {
  time: string; // e.g., '10 AM'
  hour: number;
  isoTime?: string;
  temperature: number;
  feelsLike?: number;
  humidity: number;
  windSpeed?: number;
  precipitation?: number;
  precipitationProbability?: number;
  uvIndex?: number;
  condition?: string;
  thermalStress: number;
  riskLevel: RiskLevel;
  isPeak: boolean;
}

export interface DailyHeatForecast {
  day: string; // 'Tomorrow', 'Thu', 'Fri'
  date: string; // '10 Sep'
  isoDate?: string;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  peakThermalStress: number;
  riskLevel: RiskLevel;
  riskProbability: number; // in %
  peakRiskPeriod: string; // e.g., '1:00 PM - 4:00 PM'
  aiSummary: string;
  condition?: string;
  conditionDescription?: string;
  uvIndexMax?: number;
  sunrise?: string;
  sunset?: string;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'heatwave' | 'safety' | 'system';
  title: string;
  message: string;
  timestamp: string;
  location: string;
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
  severity: 'extreme' | 'high' | 'moderate' | 'info';
  actualValue?: string;
  threshold?: string;
  recommendedAction?: string;
}

export interface NormalizedWeatherData {
  location: {
    name: string;
    district?: string;
    state?: string;
    country?: string;
    lat: number;
    lng: number;
  };
  current: WeatherMetrics;
  airQuality: AirQualityMetrics;
  hourly: HourlyHeatRisk[];
  daily: DailyHeatForecast[];
  isLive: boolean;
  isCached: boolean;
  provider?: string;
  updatedAt: string;
}

export interface PersonalRiskInput {
  ageGroup: 'Under 18' | '18-40' | '41-60' | '60+';
  activityLevel: 'Resting' | 'Light' | 'Moderate' | 'Heavy';
  exposure: 'Indoor' | 'Outdoor Shaded' | 'Direct Sun';
  duration: '<30 min' | '30-60 min' | '1-2 hours' | '2+ hours';
  userCategory: UserCategory;
  hasMedicalConditions: boolean;
}

export interface PersonalRiskResult {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  vulnerabilityIndex: number;
  keyContributingFactors: { factor: string; impact: 'Low' | 'Moderate' | 'High' | 'Severe' }[];
  tailoredActions: string[];
  warningSigns: string[];
}

export interface DailyHeatReport {
  date: string;
  locationName: string;
  state: string;
  avgTemp: number;
  peakTemp: number;
  peakTempTime: string;
  avgHumidity: number;
  maxThermalStress: number;
  highestRisk: RiskLevel;
  peakRiskPeriod: string;
  heatwaveStatus: 'None' | 'Alert' | 'Severe Heatwave' | 'Extreme Red Alert';
  precautionsTakenSummary: string;
  totalVulnerablePopulationRiskEstimate: string;
}

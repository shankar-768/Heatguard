import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CityLocation, WeatherMetrics, HourlyHeatRisk, DailyHeatForecast, AirQualityMetrics, NormalizedWeatherData } from '../types';
import { locationService, DEFAULT_LOCATION } from '../services/locationService';
import { weatherService } from '../services/weatherService';
import { calculateHeatStress } from '../services/heatStressEngine';

interface LocationContextType {
  currentLocation: CityLocation;
  weather: WeatherMetrics;
  airQuality: AirQualityMetrics | null;
  hourlyForecast: HourlyHeatRisk[];
  multiDayForecast: DailyHeatForecast[];
  allLocations: CityLocation[];
  recentLocations: CityLocation[];
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
  isCached: boolean;
  lastUpdatedTime: string;
  locationSource: 'geolocation' | 'onboarding' | 'manual';
  setLocationById: (id: string) => void;
  setLocation: (loc: CityLocation) => void;
  isDetectingLocation: boolean;
  detectLocation: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  overrideRiskLevel: (riskLevel: CityLocation['riskLevel'], thermalStress: number, temp?: number) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Initial placeholder until live API completes
const INITIAL_WEATHER: WeatherMetrics = {
  temperature: 32.0,
  humidity: 55,
  feelsLike: 35.0,
  windSpeed: 12.0,
  uvIndex: 6.0,
  dewPoint: 21.0,
  visibility: 10.0,
  pressure: 1010,
  solarRadiation: 550,
  condition: 'Synchronizing Live Telemetry',
  conditionDescription: 'Connecting to global WeatherAPI gateway...',
  updatedAt: 'Fetching live telemetry...',
  isLive: false,
  isCached: false,
  provider: 'WeatherAPI.com'
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<CityLocation>(() => locationService.getInitialLocation());
  const [recentLocations, setRecentLocations] = useState<CityLocation[]>(() => locationService.getRecentLocations());
  const [weather, setWeather] = useState<WeatherMetrics>(INITIAL_WEATHER);
  const [airQuality, setAirQuality] = useState<AirQualityMetrics | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyHeatRisk[]>([]);
  const [multiDayForecast, setMultiDayForecast] = useState<DailyHeatForecast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Syncing...');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<'geolocation' | 'onboarding' | 'manual'>('manual');

  // Load weather data for the selected location
  const loadWeather = useCallback(async (loc: CityLocation) => {
    setIsLoading(true);
    setError(null);

    try {
      const data: NormalizedWeatherData = await weatherService.fetchWeatherData(loc);

      setWeather(data.current);
      setAirQuality(data.airQuality);
      setHourlyForecast(data.hourly);
      setMultiDayForecast(data.daily);
      setIsLive(data.isLive);
      setIsCached(data.isCached);
      setLastUpdatedTime(data.updatedAt);

      // Compute real biometeorological risk from live weather
      const liveThermalRisk = calculateHeatStress({
        temperature: data.current.temperature,
        humidity: data.current.humidity,
        windSpeed: data.current.windSpeed,
        uvIndex: data.current.uvIndex
      });

      // Update current location with actual live computed risk parameters
      setCurrentLocation((prev) => ({
        ...prev,
        riskLevel: liveThermalRisk.riskCategory,
        thermalStressScore: liveThermalRisk.score,
        baseTemp: data.current.temperature,
        baseHumidity: data.current.humidity
      }));
    } catch (err: any) {
      console.error('[LocationContext] Error fetching weather data:', err);
      setError(err?.message || 'Unable to retrieve current weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch real data on location change (latitude and longitude)
  useEffect(() => {
    loadWeather(currentLocation);
  }, [currentLocation.lat, currentLocation.lng, loadWeather]);

  const setLocation = (loc: CityLocation) => {
    setLocationSource('manual');
    setCurrentLocation(loc);
    locationService.saveSelectedLocation(loc);
    setRecentLocations(locationService.getRecentLocations());
  };

  const setLocationById = (id: string) => {
    const loc = locationService.getLocationById(id);
    if (loc) {
      setLocation(loc);
    }
  };

  const refreshWeather = async () => {
    await loadWeather(currentLocation);
  };

  /**
   * Browser Geolocation detection with reverse geocoding
   */
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    setError(null);

    try {
      const detected = await locationService.detectUserLocation();
      setLocationSource('geolocation');
      setLocation(detected);
    } catch (err: any) {
      console.warn('[LocationContext] Geolocation request unsuccessful:', err.message);
      setError(`Geolocation unavailable (${err.message}). Current station: ${currentLocation.name}.`);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  /**
   * Manual risk override (e.g., in simulations or high-stress triggers)
   */
  const overrideRiskLevel = (riskLevel: CityLocation['riskLevel'], thermalStress: number, temp?: number) => {
    setCurrentLocation((prev) => ({
      ...prev,
      riskLevel,
      thermalStressScore: thermalStress,
      baseTemp: temp !== undefined ? temp : prev.baseTemp
    }));

    if (temp !== undefined) {
      setWeather((prev) => ({
        ...prev,
        temperature: temp,
        feelsLike: Math.round((temp + 4) * 10) / 10
      }));
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        weather,
        airQuality,
        hourlyForecast,
        multiDayForecast,
        allLocations: recentLocations,
        recentLocations,
        isLoading,
        error,
        isLive,
        isCached,
        lastUpdatedTime,
        locationSource,
        setLocationById,
        setLocation,
        isDetectingLocation,
        detectLocation,
        refreshWeather,
        overrideRiskLevel
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};

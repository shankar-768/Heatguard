import { CityLocation } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

/**
 * Standard default telemetry station when no location has been selected yet
 */
export const DEFAULT_LOCATION: CityLocation = {
  id: 'vijayawada-station',
  name: 'Vijayawada',
  city: 'Vijayawada',
  district: 'NTR District',
  state: 'Andhra Pradesh',
  region: 'Andhra Pradesh',
  country: 'India',
  lat: 16.5062,
  lng: 80.6480,
  latitude: 16.5062,
  longitude: 80.6480,
  timezone: 'Asia/Kolkata',
  displayName: 'Vijayawada, Andhra Pradesh, India',
  baseTemp: 36.0,
  baseHumidity: 50,
  riskLevel: 'Moderate',
  thermalStressScore: 50
};

const STORAGE_KEY_RECENT_LOCATIONS = 'heatguard_recent_locations';
const STORAGE_KEY_ACTIVE_LOCATION = 'heatguard_selected_location';

export const locationService = {
  /**
   * Get initial location (stored user choice, or default telemetry station)
   */
  getInitialLocation(): CityLocation {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_LOCATION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored location:', e);
    }
    return DEFAULT_LOCATION;
  },

  /**
   * Save selected location to persistent storage
   */
  saveSelectedLocation(location: CityLocation): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_LOCATION, JSON.stringify(location));
      this.addRecentLocation(location);
    } catch (e) {
      console.warn('Failed to save selected location:', e);
    }
  },

  /**
   * Get user's recently searched/selected locations (from cache)
   */
  getRecentLocations(): CityLocation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENT_LOCATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [DEFAULT_LOCATION];
  },

  /**
   * Fetch previously searched locations directly from the backend database
   */
  async fetchRecentLocationsFromDb(): Promise<CityLocation[]> {
    try {
      const token = localStorage.getItem('heatguard_session_token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/user/searches`, {
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.searches) && data.searches.length > 0) {
          const mapped: CityLocation[] = data.searches.map((s: any) => ({
            id: s.id || `loc-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: s.name,
            city: s.city || s.name,
            district: s.district || s.state || '',
            state: s.state || s.region || '',
            region: s.region || s.state || '',
            country: s.country || 'India',
            lat: typeof s.lat === 'number' ? s.lat : parseFloat(s.lat) || 16.5062,
            lng: typeof s.lng === 'number' ? s.lng : parseFloat(s.lng) || 80.6480,
            latitude: typeof s.lat === 'number' ? s.lat : parseFloat(s.lat) || 16.5062,
            longitude: typeof s.lng === 'number' ? s.lng : parseFloat(s.lng) || 80.6480,
            displayName: s.displayName || `${s.name}${s.state ? `, ${s.state}` : ''}`,
            baseTemp: 32.0,
            baseHumidity: 50,
            riskLevel: 'Moderate',
            thermalStressScore: 50
          }));
          localStorage.setItem(STORAGE_KEY_RECENT_LOCATIONS, JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch (err) {
      console.warn('[locationService] Failed to load searches from database, using cache:', err);
    }
    return this.getRecentLocations();
  },

  /**
   * Add a location to search history (persists in both localStorage and backend database)
   */
  addRecentLocation(location: CityLocation): void {
    // 1. Save to client cache for immediate UI rendering
    try {
      const recents = this.getRecentLocations();
      const filtered = recents.filter(
        (r) =>
          r.name.toLowerCase() !== location.name.toLowerCase() ||
          Math.abs(r.lat - location.lat) > 0.1 ||
          Math.abs(r.lng - location.lng) > 0.1
      );
      const updated = [location, ...filtered].slice(0, 10);
      localStorage.setItem(STORAGE_KEY_RECENT_LOCATIONS, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // 2. Persist to backend database asynchronously
    try {
      const token = localStorage.getItem('heatguard_session_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`${API_BASE}/user/searches`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          id: location.id,
          name: location.name,
          city: location.city || location.name,
          district: location.district || location.state || '',
          state: location.state || location.region || '',
          region: location.region || location.state || '',
          country: location.country || 'India',
          lat: location.lat,
          lng: location.lng,
          displayName: location.displayName
        })
      }).catch((err) => console.warn('[locationService] Failed to save search to database:', err));
    } catch {
      // ignore async errors
    }
  },

  /**
   * Clear all search history from local storage and backend database
   */
  async clearSearchHistory(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_RECENT_LOCATIONS);
    try {
      const token = localStorage.getItem('heatguard_session_token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/user/searches`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
    } catch (err) {
      console.warn('[locationService] Failed to clear searches from DB:', err);
    }
  },

  /**
   * Dynamic global location search powered by WeatherAPI (/search.json)
   */
  async searchLocations(query: string): Promise<CityLocation[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE}/geocode/search?q=${encodeURIComponent(trimmed)}`, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Location service is temporarily unavailable.');
        }
        throw new Error('Unable to search locations. Please try again.');
      }

      const data = await response.json();
      const results = data.results || [];

      if (!Array.isArray(results) || results.length === 0) {
        return [];
      }

      return results.map((r: any): CityLocation => {
        const cityName = r.name || r.city || 'Unknown Location';
        const region = r.region || r.state || r.district || '';
        const country = r.country || '';
        const displayName = r.displayName || `${cityName}${region ? `, ${region}` : ''}${country ? `, ${country}` : ''}`;
        const lat = typeof r.lat === 'number' ? r.lat : parseFloat(r.lat) || 0;
        const lng = typeof r.lng === 'number' ? r.lng : parseFloat(r.lng) || 0;

        return {
          id: String(r.id || `loc-${cityName.toLowerCase().replace(/\s+/g, '-')}-${lat}-${lng}`),
          name: cityName,
          city: cityName,
          district: region,
          state: region,
          region,
          country,
          lat,
          lng,
          latitude: lat,
          longitude: lng,
          displayName,
          timezone: r.timezone,
          baseTemp: 32.0,
          baseHumidity: 50,
          riskLevel: 'Moderate',
          thermalStressScore: 50,
          elevationMeters: r.elevation || 0
        };
      });
    } catch (err: any) {
      console.error('[locationService] searchLocations error:', err);
      throw err;
    }
  },

  /**
   * Genuine browser geolocation using GPS with reverse-geocoding via WeatherAPI
   */
  async detectUserLocation(): Promise<CityLocation> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser.');
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    return this.getLocationFromCoords(lat, lng);
  },

  /**
   * Reverse-geocode coordinates into readable CityLocation object
   */
  async getLocationFromCoords(lat: number, lng: number): Promise<CityLocation> {
    let cityName = 'Detected Location';
    let region = '';
    let country = 'India';
    let displayName = `GPS (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;

    try {
      const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const geoData = await res.json();
        cityName = geoData.name || geoData.city || cityName;
        region = geoData.region || geoData.district || geoData.state || '';
        country = geoData.country || country;
        displayName = geoData.displayName || `${cityName}${region ? `, ${region}` : ''}${country ? `, ${country}` : ''}`;
      }
    } catch (err) {
      console.warn('[locationService] Reverse geocode error:', err);
    }

    const detectedLoc: CityLocation = {
      id: `gps-${lat.toFixed(3)}-${lng.toFixed(3)}`,
      name: cityName,
      city: cityName,
      district: region,
      state: region,
      region,
      country,
      lat,
      lng,
      latitude: lat,
      longitude: lng,
      displayName,
      baseTemp: 32.0,
      baseHumidity: 50,
      riskLevel: 'Moderate',
      thermalStressScore: 50
    };

    return detectedLoc;
  },

  // Backward-compatibility helpers for components transitioning to dynamic search
  getAllLocations(): CityLocation[] {
    return this.getRecentLocations();
  },

  getLocationById(id: string): CityLocation {
    const found = this.getRecentLocations().find(c => c.id.toLowerCase() === id.toLowerCase());
    return found || DEFAULT_LOCATION;
  },

  getLocationByName(name: string): CityLocation {
    const lower = name.toLowerCase();
    const found = this.getRecentLocations().find(
      c => c.name.toLowerCase() === lower || c.name.toLowerCase().includes(lower)
    );
    return found || DEFAULT_LOCATION;
  }
};

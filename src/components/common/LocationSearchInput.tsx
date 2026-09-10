import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, LocateFixed, Loader2, AlertCircle, History, X } from 'lucide-react';
import { CityLocation } from '../../types';
import { locationService } from '../../services/locationService';

interface LocationSearchInputProps {
  onSelectLocation: (location: CityLocation) => void;
  placeholder?: string;
  currentValue?: string;
  className?: string;
  showGpsOption?: boolean;
  autoFocus?: boolean;
  onClose?: () => void;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelectLocation,
  placeholder = 'Search city, town or location...',
  currentValue = '',
  className = '',
  showGpsOption = true,
  autoFocus = false,
  onClose
}) => {
  const [query, setQuery] = useState(currentValue);
  const [results, setResults] = useState<CityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentLocations, setRecentLocations] = useState<CityLocation[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent locations on mount (cache first, then live database sync)
  useEffect(() => {
    setRecentLocations(locationService.getRecentLocations());
    locationService.fetchRecentLocationsFromDb().then(dbLocations => {
      if (Array.isArray(dbLocations) && dbLocations.length > 0) {
        setRecentLocations(dbLocations);
      }
    });
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    locationService.fetchRecentLocationsFromDb().then(dbLocations => {
      if (Array.isArray(dbLocations) && dbLocations.length > 0) {
        setRecentLocations(dbLocations);
      }
    });
  };

  // Update query if parent passed a different currentValue
  useEffect(() => {
    if (currentValue && !isOpen) {
      setQuery(currentValue);
    }
  }, [currentValue, isOpen]);

  // Click outside listener to close results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input changes with 350ms debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setErrorMessage(null);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim() || text.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const locations = await locationService.searchLocations(text);
        setResults(locations);
        setErrorMessage(null);
      } catch (err: any) {
        setResults([]);
        if (err.message && err.message.includes('unavailable')) {
          setErrorMessage('Location service is temporarily unavailable.');
        } else {
          setErrorMessage('Unable to search locations. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handleRetry = () => {
    if (query.trim().length >= 2) {
      setIsLoading(true);
      setErrorMessage(null);
      locationService
        .searchLocations(query)
        .then((locs) => {
          setResults(locs);
          setErrorMessage(null);
        })
        .catch((err) => {
          setResults([]);
          setErrorMessage(err.message || 'Unable to search locations. Please try again.');
        })
        .finally(() => setIsLoading(false));
    }
  };

  const handleSelect = (loc: CityLocation) => {
    setQuery(loc.displayName || `${loc.name}${loc.state ? `, ${loc.state}` : ''}${loc.country ? `, ${loc.country}` : ''}`);
    setIsOpen(false);
    onSelectLocation(loc);
    locationService.addRecentLocation(loc);
    setRecentLocations(locationService.getRecentLocations());
    if (onClose) onClose();
  };

  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setErrorMessage(null);
    try {
      const detected = await locationService.detectUserLocation();
      handleSelect(detected);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to retrieve GPS coordinates. Please search manually.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const clearInput = () => {
    setQuery('');
    setResults([]);
    setErrorMessage(null);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition shadow-inner"
        />

        {/* Clear or Loading Icon */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={clearInput}
              className="text-slate-400 hover:text-white transition cursor-pointer p-0.5"
              aria-label="Clear location search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Results Box */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 right-0 max-h-72 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {/* GPS Location Option */}
          {showGpsOption && (
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition text-left cursor-pointer border border-transparent hover:border-orange-500/20 disabled:opacity-50"
            >
              {isDetectingGps ? (
                <Loader2 className="w-4 h-4 text-orange-400 animate-spin shrink-0" />
              ) : (
                <LocateFixed className="w-4 h-4 text-orange-400 shrink-0" />
              )}
              <div className="flex-1">
                <span className="block font-bold">
                  {isDetectingGps ? 'Detecting current coordinates...' : 'Use my current location'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Automatic GPS coordinates detection
                </span>
              </div>
            </button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-4 px-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
              <span>Searching locations...</span>
            </div>
          )}

          {/* Error Message with Retry */}
          {errorMessage && !isLoading && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 text-[11px] underline text-orange-400 hover:text-orange-300 font-bold cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            </div>
          )}

          {/* Empty Search Results */}
          {!isLoading && !errorMessage && query.trim().length >= 2 && results.length === 0 && (
            <div className="py-6 px-3 text-center text-xs text-slate-400">
              <p className="font-semibold text-slate-300">No matching locations found.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching with a country, district, or alternative spelling.
              </p>
            </div>
          )}

          {/* Search Results List */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matching Global Locations ({results.length})
              </div>
              {results.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left hover:bg-slate-800 text-slate-200 transition cursor-pointer group"
                >
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors truncate">
                      {loc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {loc.state ? `${loc.state}, ` : ''}{loc.country || ''}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {loc.lat.toFixed(3)}°, {loc.lng.toFixed(3)}°
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches (shown when query is empty) */}
          {!isLoading && query.trim().length < 2 && recentLocations.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-orange-400" />
                  <span>Previous Searches (Database Synced)</span>
                </div>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await locationService.clearSearchHistory();
                    setRecentLocations([]);
                  }}
                  className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer font-normal normal-case transition"
                >
                  Clear History
                </button>
              </div>
              {recentLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-800 text-slate-300 transition cursor-pointer group text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors shrink-0" />
                    <span className="font-semibold text-white truncate">{loc.name}</span>
                    <span className="text-slate-400 text-[11px] truncate">
                      ({loc.state || loc.country || 'Station'})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                    {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

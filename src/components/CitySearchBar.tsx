'use client';

import React from 'react';
import { Search, Crosshair } from 'lucide-react';
import { GeocodingResult } from '@/services/geocoding/geocodingService';
import { usePreferences } from '@/context/PreferencesContext';

interface CitySearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: GeocodingResult[];
  isSearching: boolean;
  onSelectCity: (city: string, lat: number, lon: number) => void;
  onSubmitSearch?: (query?: string) => void;
  onRequestLocation: () => void;
}

/**
 * Floating city search bar with live Open-Meteo autocomplete, GPS trigger,
 * and instant Enter/Search submission.
 */
export function CitySearchBar({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onSelectCity,
  onSubmitSearch,
  onRequestLocation,
}: CitySearchBarProps) {
  const { language, t } = usePreferences();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      const top = searchResults[0];
      onSelectCity(top.name, top.latitude, top.longitude);
    } else if (onSubmitSearch) {
      onSubmitSearch(searchQuery);
    }
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-11 py-3 rounded-2xl text-sm bg-white/95 dark:bg-white text-slate-900 placeholder:text-slate-400 border border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label={t.searchPlaceholder}
          />
          {isSearching ? (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-bold animate-pulse">
              ...
            </span>
          ) : (
            <button
              type="button"
              onClick={onRequestLocation}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
              title={t.useMyLocation}
              aria-label={t.useMyLocation}
            >
              <Crosshair className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition flex-shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t.searchButton || (language === 'hi' ? 'खोजें' : 'Search')}</span>
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          <ul role="listbox">
            {searchResults.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => onSelectCity(city.name, city.latitude, city.longitude)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 flex items-center justify-between transition border-b last:border-b-0 border-slate-100"
                >
                  <span className="font-bold text-slate-900">{city.name}</span>
                  <span className="text-xs text-slate-500">
                    {city.admin1 ? `${city.admin1}, ` : ''}
                    {city.country}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

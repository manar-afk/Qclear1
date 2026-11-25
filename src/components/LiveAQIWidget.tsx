'use client';

import React from 'react';
import { AirQualityData } from '@/services/aqi/types';
import { AQI_BANDS } from '@/constants/aqiBands';
import { usePreferences } from '@/context/PreferencesContext';
import { CitySearchBar } from './CitySearchBar';
import {
  RotateCw,
  MapPin,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Biohazard,
  Info,
  Clock,
  Radio,
  Wind,
} from 'lucide-react';
import { GeocodingResult } from '@/services/geocoding/geocodingService';

interface LiveAQIWidgetProps {
  data: AirQualityData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: GeocodingResult[];
  isSearching: boolean;
  onSelectCity: (city: string, lat: number, lon: number) => void;
  onSubmitSearch?: (query?: string) => void;
  onRequestLocation: () => void;
  popularCities: GeocodingResult[];
}

export function LiveAQIWidget({
  data,
  isLoading,
  isRefreshing,
  onRefresh,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onSelectCity,
  onSubmitSearch,
  onRequestLocation,
  popularCities,
}: LiveAQIWidgetProps) {
  const { language, t } = usePreferences();

  const current = data?.current;
  const category = current?.category || 'hazardous';
  const band = AQI_BANDS[category];
  const aqiValue = current?.usAqi ?? 0;

  const formattedLastUpdated = data?.timestamp
    ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--';

  // 270-degree SVG Arc Gauge calculations
  const radius = 56;
  const circumference = 2 * Math.PI * radius; // ~351.86
  const arcLength = circumference * 0.75; // 270 deg (~263.89)
  const progressRatio = Math.min(1, Math.max(0.06, aqiValue / 400));
  const activeLength = arcLength * progressRatio;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />;
      case 'AlertCircle':
        return <AlertCircle className="w-4 h-4 text-amber-400" aria-hidden="true" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-orange-400" aria-hidden="true" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-red-400" aria-hidden="true" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-purple-400" aria-hidden="true" />;
      case 'Biohazard':
      default:
        return <Biohazard className="w-4 h-4 text-rose-400" aria-hidden="true" />;
    }
  };

  return (
    <section
      className="glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden space-y-6"
      aria-label="Live Air Quality Dashboard"
    >
      {/* Subtle Atmospheric Skyline Silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-36 opacity-[0.06] pointer-events-none text-white"
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,180 L0,120 Q150,70 320,115 T660,95 T980,125 T1200,85 L1200,180 Z"
          fill="currentColor"
        />
      </svg>

      {/* Dynamic Status Live Region for Screen Readers */}
      <div aria-live="polite" className="sr-only">
        {isRefreshing
          ? t.refreshing
          : `${t.lastUpdated}: ${formattedLastUpdated}. Current AQI is ${aqiValue}, ${band?.labelEn}.`}
      </div>

      {/* Top Banner: Source Transparency & Last Updated */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/25 font-semibold">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" aria-hidden="true" />
          <span>{t.dataSourceNotice}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.lastUpdated}:</span>
          <span className="font-bold text-slate-200">{formattedLastUpdated}</span>
        </div>
      </div>

      {/* Search & Quick Cities Controls */}
      <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <CitySearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onSelectCity={onSelectCity}
          onSubmitSearch={onSubmitSearch}
          onRequestLocation={onRequestLocation}
        />

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
          {/* Popular Cities Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {popularCities.slice(0, 4).map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelectCity(city.name, city.latitude, city.longitude)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition border ${
                  data?.city === city.name
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-sm'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className="min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 disabled:opacity-50 transition"
            aria-label={t.refreshButton}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isRefreshing ? t.refreshing : t.refreshButton}</span>
          </button>
        </div>
      </div>

      {/* Hero Primary Display */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Fetching real-time atmospheric data...</p>
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          {/* Left/Center: Location + Glowing Arc Gauge */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-white/[0.04] border border-white/10">
            {/* Glowing 270-degree SVG Arc Gauge */}
            <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 140 140" aria-hidden="true">
                {/* Background Track Arc */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${arcLength} ${circumference}`}
                  transform="rotate(135 70 70)"
                />
                {/* Active Glowing Progress Arc */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={band.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${activeLength} ${circumference}`}
                  transform="rotate(135 70 70)"
                  style={{ filter: `drop-shadow(0 0 8px ${band.color}99)` }}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-1">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                  {current?.usAqi ?? '--'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                  US AQI
                </span>
              </div>
            </div>

            {/* Location & Health Advisory */}
            <div className="space-y-2.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0" aria-hidden="true" />
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {data?.city || 'New Delhi'}
                </h2>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold border ${band.patternClass} bg-white/10 text-white`}
                role="status"
              >
                {renderIcon(band.iconName)}
                <span>{language === 'hi' ? band.labelHi : band.labelEn}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                {language === 'hi' ? band.healthAdvisoryHi : band.healthAdvisoryEn}
              </p>
            </div>
          </div>

          {/* Right: 2x2 + PM2.5 Frosted Pollutant Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: t.pm25Label, value: current?.pm2_5, unit: 'µg/m³', highlight: true },
              { label: t.pm10Label, value: current?.pm10, unit: 'µg/m³' },
              { label: t.no2Label, value: current?.nitrogenDioxide, unit: 'µg/m³' },
              { label: t.o3Label, value: current?.ozone, unit: 'µg/m³' },
              { label: t.coLabel, value: current?.carbonMonoxide, unit: 'µg/m³' },
              {
                label: language === 'hi' ? 'डेटा प्रकार' : 'Source Type',
                value: data?.isModeledEstimate ? (language === 'hi' ? 'मॉडल' : 'Model') : 'Sensor',
                unit: data?.source || 'open-meteo',
                isMeta: true,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition ${
                  item.highlight
                    ? 'bg-white/[0.08] border-sky-400/30'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-400 truncate">
                  <span className="truncate">{item.label}</span>
                  <Wind className="w-3 h-3 text-slate-500 flex-shrink-0" aria-hidden="true" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {item.value ?? '--'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modeled Estimate Footnote */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-400 pt-1">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" aria-hidden="true" />
        <span>{t.modeledEstimateNotice}</span>
      </div>
    </section>
  );
}

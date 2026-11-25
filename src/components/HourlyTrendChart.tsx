'use client';

import React, { useState } from 'react';
import { AirQualityData } from '@/services/aqi/types';
import { usePreferences } from '@/context/PreferencesContext';
import { TrendingUp, Wind, AlertOctagon } from 'lucide-react';

interface HourlyTrendChartProps {
  data: AirQualityData | null;
}

interface ChartPoint {
  x: number;
  y: number;
  time: string;
  pm2_5: number;
  pm10: number;
  usAqi: number;
}

/**
 * Generates a smooth cubic Bezier SVG path through an array of 2D points.
 */
function buildSmoothSpline(pts: ChartPoint[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function HourlyTrendChart({ data }: HourlyTrendChartProps) {
  const { language, t } = usePreferences();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hourly = data?.hourly || [];
  const ventilationWindow = data?.ventilationWindow;
  const peakSmogWindow = data?.peakSmogWindow;

  if (hourly.length === 0) {
    return null;
  }

  const maxPm25 = Math.max(...hourly.map((h) => h.pm2_5), 100);
  const chartHeight = 180;
  const chartWidth = 760;
  const paddingX = 28;
  const paddingY = 26;

  const points: ChartPoint[] = hourly.map((h, i) => {
    const x = paddingX + (i / Math.max(1, hourly.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (h.pm2_5 / maxPm25) * (chartHeight - paddingY * 2);
    return { x, y, ...h };
  });

  const pathD = buildSmoothSpline(points);
  const baselineY = chartHeight - paddingY;
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;

  // Highlight either hovered point or peak PM2.5 point
  const peakIdx = points.reduce((best, p, i) => (p.pm2_5 > points[best].pm2_5 ? i : best), 0);
  const activeIdx = hoveredIndex !== null ? hoveredIndex : peakIdx;
  const activePoint = points[activeIdx];

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return iso.slice(11, 16);
    }
  };

  return (
    <section
      className="glass-panel rounded-3xl p-5 sm:p-7 space-y-5"
      aria-label="24-Hour Air Quality & Ventilation Forecast"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <span>{t.trendTitle}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{t.trendSubtitle}</p>
        </div>

        {/* Distinct Ventilation & Peak Smog Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {ventilationWindow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-bold">
              <Wind className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>
                {t.ventilationWindowBadge}: {ventilationWindow.label}
              </span>
            </div>
          )}
          {peakSmogWindow && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/35 text-rose-300 text-xs font-bold">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
              <span>
                {t.peakSmogWindowBadge}: {peakSmogWindow.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Smooth Dual-Tone Bezier SVG Chart */}
      <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible"
          role="img"
          aria-label={t.trendTitle}
        >
          <defs>
            <linearGradient id="qclearLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            <linearGradient id="qclearAreaGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.24" />
            </linearGradient>
          </defs>

          {/* Horizontal subtle reference lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const yPos = baselineY - ratio * (chartHeight - paddingY * 2);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={yPos}
                x2={chartWidth - paddingX}
                y2={yPos}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#qclearAreaGrad)" />

          {/* Smooth glowing spline */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#qclearLineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Vertical dashed guide line at active/peak point */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingY - 6}
                x2={activePoint.x}
                y2={baselineY}
                stroke="rgba(255,255,255,0.3)"
                strokeDasharray="4 4"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#ffffff"
                stroke="#38bdf8"
                strokeWidth="3"
              />
              <text
                x={activePoint.x}
                y={Math.max(14, activePoint.y - 12)}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="700"
              >
                {Math.round(activePoint.pm2_5)} µg/m³ ({formatTime(activePoint.time)})
              </text>
            </g>
          )}

          {/* Interactive hover targets */}
          {points.map((p, i) => (
            <circle
              key={p.time}
              cx={p.x}
              cy={p.y}
              r="10"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Bottom Time Ticks */}
        <div className="flex justify-between text-[11px] font-medium text-slate-400 px-2 pt-1">
          <span>{formatTime(hourly[0].time)}</span>
          <span>{formatTime(hourly[Math.floor(hourly.length / 4)].time)}</span>
          <span>{formatTime(hourly[Math.floor(hourly.length / 2)].time)}</span>
          <span>{formatTime(hourly[Math.floor((hourly.length * 3) / 4)].time)}</span>
          <span>{formatTime(hourly[hourly.length - 1].time)}</span>
        </div>
      </div>

      {/* Explanatory Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200">
          <span className="font-bold text-emerald-300">
            {language === 'hi' ? 'वेंटिलेशन सलाह: ' : 'Ventilation Advice: '}
          </span>
          {t.recommendedVentilationText}
        </div>
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-200">
          <span className="font-bold text-rose-300">
            {language === 'hi' ? 'चरम स्मॉग चेतावनी: ' : 'Peak Smog Warning: '}
          </span>
          {t.peakSmogText}
        </div>
      </div>
    </section>
  );
}

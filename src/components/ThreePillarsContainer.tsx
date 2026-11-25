'use client';

import React, { useState } from 'react';
import { ActionCard } from './ActionCard';
import { AIRecommendationsOutput } from '@/lib/schemas/aiRequestSchema';
import { usePreferences } from '@/context/PreferencesContext';
import { Clock, Wrench, Globe, CalendarDays } from 'lucide-react';

interface ThreePillarsContainerProps {
  recommendations: AIRecommendationsOutput | null;
  isLoading: boolean;
  isAIGenerated: boolean;
  modelName: string;
}

export function ThreePillarsContainer({
  recommendations,
  isLoading,
  isAIGenerated,
  modelName,
}: ThreePillarsContainerProps) {
  const { language, t } = usePreferences();
  const [activeTab, setActiveTab] = useState<'routines' | 'hacks' | 'alternatives'>('routines');

  const routines = recommendations?.dailyRoutines || [];
  const hacks = recommendations?.iaqHacks || [];
  const alternatives = recommendations?.sustainableAlternatives || [];

  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-7 space-y-6" aria-label="The Three Pillars of Clean Living">
      {/* Pillar Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-400" aria-hidden="true" />
            <span>{language === 'hi' ? 'स्मॉग से बचाव के 3 मुख्य स्तंभ' : 'The Three Pillars of Smog Defense'}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'लाइव वायु गुणवत्ता और आपके परिवार की जरूरतों के अनुसार अनुकूलित कार्ययोजना'
              : 'Tailored specifically to live ambient AQI and your selected household profile'}
          </p>
        </div>

        {/* Pill Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full self-start sm:self-auto" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'routines'}
            onClick={() => setActiveTab('routines')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'routines'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t.pillarRoutines}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'hacks'}
            onClick={() => setActiveTab('hacks')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'hacks'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{t.pillarHacks}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'alternatives'}
            onClick={() => setActiveTab('alternatives')}
            className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'alternatives'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.pillarAlternatives}</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse space-y-4">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-6 bg-white/10 rounded w-3/4" />
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Pillar 1: Daily Routines */}
          {activeTab === 'routines' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {routines.map((item, idx) => (
                <ActionCard
                  key={idx}
                  title={item.action}
                  actionText={item.rationale}
                  timeBlock={item.timeBlock}
                  maskGuidance={item.maskGuidance}
                  indoorReductionPct={item.indoorPm25ReductionPct}
                  weeklyEmissionsAvoidedG={item.weeklyEmissionsAvoidedG}
                  isAIGenerated={isAIGenerated}
                  modelName={modelName}
                />
              ))}
            </div>
          )}

          {/* Pillar 2: IAQ Hacks */}
          {activeTab === 'hacks' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hacks.map((item, idx) => (
                <ActionCard
                  key={idx}
                  title={item.title}
                  actionText={item.actionSteps}
                  rationale={item.whyThisMatters}
                  tier={item.tier}
                  costEstimate={item.costEstimate}
                  indoorReductionPct={item.indoorPm25ReductionPct}
                  weeklyEmissionsAvoidedG={item.weeklyEmissionsAvoidedG}
                  isAIGenerated={isAIGenerated}
                  modelName={modelName}
                />
              ))}
            </div>
          )}

          {/* Pillar 3: Sustainable Alternatives */}
          {activeTab === 'alternatives' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((item, idx) => (
                <ActionCard
                  key={idx}
                  title={item.title}
                  actionText={item.action}
                  rationale={item.whyThisMatters}
                  indoorReductionPct={item.indoorPm25ReductionPct}
                  weeklyEmissionsAvoidedG={item.weeklyEmissionsAvoidedG}
                  isAIGenerated={isAIGenerated}
                  modelName={modelName}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

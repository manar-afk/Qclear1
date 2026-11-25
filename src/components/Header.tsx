'use client';

import React from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { Wind, Languages, Eye, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenDisclaimer?: () => void;
}

export function Header({ onOpenDisclaimer }: HeaderProps) {
  const {
    language,
    setLanguage,
    isSimpleLanguage,
    toggleSimpleLanguage,
    isHighContrast,
    toggleHighContrast,
    t,
  } = usePreferences();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-lg transition-colors" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25" aria-hidden="true">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-black tracking-tight text-white">
                QCLEAR
              </span>
              <span className="text-xs text-slate-400 font-medium">|</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30">
                {language === 'hi' ? 'शुद्ध वायु साथी' : 'CleanAir'}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5" role="toolbar" aria-label="Application controls">
          {/* Simple Language Toggle */}
          <button
            type="button"
            onClick={toggleSimpleLanguage}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isSimpleLanguage
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-sm'
                : 'bg-white/5 text-slate-200 hover:bg-white/10 border-white/15'
            }`}
            aria-pressed={isSimpleLanguage}
            aria-label={t.simpleLanguageToggle}
            title={language === 'hi' ? 'छोटे और आसान शब्दों में मार्गदर्शन' : 'Short sentences and plain words'}
          >
            <span>{language === 'hi' ? 'सरल भाषा' : 'Simple Language'}</span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`min-h-[44px] min-w-[44px] p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all border ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
                : 'bg-white/5 text-slate-200 hover:bg-white/10 border-white/15'
            }`}
            aria-pressed={isHighContrast}
            aria-label={t.highContrastToggle}
            title={t.highContrastToggle}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">{t.highContrastToggle}</span>
          </button>

          {/* Language Switcher (EN / HI) */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-sm"
            aria-label={`Switch language to ${language === 'en' ? 'Hindi' : 'English'}`}
          >
            <Languages className="w-4 h-4" aria-hidden="true" />
            <span>{t.languageSwitch}</span>
          </button>

          {/* Methodology / Disclaimer Button */}
          {onOpenDisclaimer && (
            <button
              type="button"
              onClick={onOpenDisclaimer}
              className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
              aria-label="View calculations methodology and medical disclaimer"
              title="Methodology & Disclaimer"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

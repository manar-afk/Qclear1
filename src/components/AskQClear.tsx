'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { AirQualityData } from '@/services/aqi/types';
import { HouseholdProfile } from '@/constants/presets';
import { AskResponseOutput } from '@/lib/schemas/askSchema';
import { MessageSquare, Sparkles, Shield, Send, AlertTriangle, CheckCircle } from 'lucide-react';

interface AskQClearProps {
  aqiData: AirQualityData | null;
  household: HouseholdProfile;
}

export function AskQClear({ aqiData, household }: AskQClearProps) {
  const { language, isSimpleLanguage, t } = usePreferences();

  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AskResponseOutput | null>(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [modelName, setModelName] = useState('offline-guidance');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = language === 'hi' ? [
    'क्या आज स्कूल में आउटडोर खेलकूद या प्रार्थना सभा कराना ठीक है?',
    'इस स्मॉग स्तर पर छोटे बच्चे के कमरे में हवा कैसे बदलें?',
    'क्या साधारण कपड़े का मास्क PM2.5 स्मॉग को रोक सकता है?',
    'सफर करते समय कार का एसी किस मोड पर रखना चाहिए?',
    'अस्थमा और खांसी होने पर क्या तुरंत सावधानी बरतें?',
    'घर में एयर प्यूरीफायर को किस जगह रखना सबसे असरदार है?',
  ] : [
    'Can we hold an outdoor school sports assembly today?',
    'How should we safely ventilate an infant bedroom right now?',
    'Does a standard cloth mask block toxic PM2.5 smog?',
    'Should car AC be on Recirculate or Fresh Air mode?',
    'What precautions should asthma patients take today?',
    'Where is the most effective place to put a room air purifier?',
  ];

  const handleAsk = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const q = (customQuestion ?? question).trim();
    if (!q || q.length < 3) return;

    setIsLoading(true);
    setError(null);

    const payload = {
      question: q,
      aqi: aqiData?.current.usAqi ?? 185,
      pm2_5: aqiData?.current.pm2_5 ?? 120,
      pm10: aqiData?.current.pm10 ?? 200,
      category: aqiData?.current.category ?? 'unhealthy',
      locationName: aqiData?.city ?? household.locationName,
      household: {
        hasToddler: household.members.hasToddler,
        hasElderly: household.members.hasElderly,
        hasRespiratorySensitivity: household.members.hasRespiratorySensitivity,
        commuteMode: household.commuteMode,
        hasPurifier: household.homeSetup.hasPurifier,
      },
      language,
      simpleLanguage: isSimpleLanguage,
    };

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to get answer`);
      }

      const json = await res.json();
      setResponse(json.data);
      setIsAIGenerated(Boolean(json.isAIGenerated));
      setModelName(json.model || 'offline-guidance');
    } catch (err: unknown) {
      console.warn('[AskQClear] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to query assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-7 space-y-5" aria-label="Ask QCLEAR Situational Smog Assistant">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-400" aria-hidden="true" />
          <h3 className="text-xl font-black text-white">
            {t.askTitle}
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {t.askSubtitle}
        </span>
      </div>

      {/* Suggested Quick Question Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-400 mr-1 self-center hidden sm:inline">
          {language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested Questions:'}
        </span>
        {sampleQuestions.map((qText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setQuestion(qText);
              handleAsk(undefined, qText);
            }}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition text-left"
          >
            {qText}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleAsk(e)} className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 300))}
            placeholder={t.askPlaceholder}
            disabled={isLoading}
            className="w-full pl-4 pr-32 py-3.5 rounded-2xl text-sm bg-white/5 border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400 text-white placeholder:text-slate-400 disabled:opacity-60"
            aria-label={t.askPlaceholder}
          />
          <button
            type="submit"
            disabled={isLoading || question.trim().length < 3}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 disabled:opacity-40 transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            {isLoading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? '...' : t.askButton}</span>
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>{language === 'hi' ? 'लाइव AQI व आपके परिवार प्रोफाइल पर आधारित' : 'Grounded in live AQI and your active profile'}</span>
          <span>{question.length}/300</span>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 text-xs border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Answer Display */}
      {response && (
        <div className="p-5 rounded-2xl bg-sky-500/10 border border-sky-400/25 space-y-3 shadow-lg animate-fadeIn">
          {/* Badge */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isAIGenerated
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/35'
                  : 'bg-white/10 text-slate-200 border-white/15'
              }`}
            >
              {isAIGenerated ? (
                <>
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>AI-Generated ({modelName})</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-slate-300" />
                  <span>{language === 'hi' ? 'स्मार्ट सलाह' : 'Smart Advisory'}</span>
                </>
              )}
            </span>

            <span className="text-[11px] text-slate-400">
              AQI: {aqiData?.current.usAqi ?? 185} ({aqiData?.current.category?.toUpperCase()})
            </span>
          </div>

          {/* Core Answer */}
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {response.answer}
          </p>

          {/* Action Item & Advisory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/15 text-emerald-200 border border-emerald-400/25">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>{language === 'hi' ? 'मुख्य कदम:' : 'Key Action:'}</strong> {response.keyActionItem}</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 text-slate-300 border border-white/10">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>{language === 'hi' ? 'स्थिति संदर्भ:' : 'Context:'}</strong> {response.severityAdvisory}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-[10px] text-slate-400 pt-2 border-t border-white/10">
            {t.askDisclaimer}
          </div>
        </div>
      )}
    </section>
  );
}

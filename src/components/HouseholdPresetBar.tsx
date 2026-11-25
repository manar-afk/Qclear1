'use client';

import React, { useState } from 'react';
import { HouseholdProfile, DEMO_PRESETS } from '@/constants/presets';
import { usePreferences } from '@/context/PreferencesContext';
import { CustomProfileModal } from './CustomProfileModal';
import { Users, Baby, HeartPulse, Bike, ShieldCheck, Flame, Sliders } from 'lucide-react';

interface HouseholdPresetBarProps {
  activeProfile: HouseholdProfile;
  onSelectPreset: (preset: HouseholdProfile) => void;
  onUpdateCustomProfile: (profile: HouseholdProfile) => void;
}

export function HouseholdPresetBar({
  activeProfile,
  onSelectPreset,
  onUpdateCustomProfile,
}: HouseholdPresetBarProps) {
  const { language, t } = usePreferences();
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEdit = (updated: HouseholdProfile) => {
    onUpdateCustomProfile(updated);
    setIsEditing(false);
  };

  return (
    <section
      className="glass-panel rounded-3xl p-5 sm:p-7 space-y-5"
      aria-label="Household Profile Tailoring"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-sky-400" aria-hidden="true" />
          <h3 className="text-lg sm:text-xl font-black text-white">
            {t.demoHouseholdsTitle}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 transition self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>{language === 'hi' ? 'प्रोफाइल बदलें' : 'Customize Profile'}</span>
        </button>
      </div>

      {/* Active Custom Profile Card */}
      {activeProfile.id === 'custom_household_profile' && (
        <div className="p-4 rounded-2xl border border-sky-400/60 bg-sky-500/10 shadow-[0_0_25px_-8px_rgba(56,189,248,0.4)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-sky-400 text-slate-950">
                Active Custom Profile
              </span>
              <span className="font-bold text-sm text-white">
                {activeProfile.locationName || 'Custom Location'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1 text-xs text-slate-200">
              {activeProfile.members.hasToddler && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10">
                  <Baby className="w-3 h-3" /> Toddler
                </span>
              )}
              {activeProfile.members.hasElderly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10">
                  <HeartPulse className="w-3 h-3" /> Elderly
                </span>
              )}
              {activeProfile.members.hasRespiratorySensitivity && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200">
                  <Flame className="w-3 h-3" /> Respiratory Sensitivity
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10">
                <Bike className="w-3 h-3" /> {activeProfile.commuteMode}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                  activeProfile.homeSetup.hasPurifier
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                {activeProfile.homeSetup.hasPurifier ? 'HEPA Purifier' : 'No Purifier'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-sky-400 hover:underline self-start sm:self-auto"
          >
            {language === 'hi' ? 'सेटिंग्स बदलें' : 'Edit Settings'}
          </button>
        </div>
      )}

      {/* Preset Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {DEMO_PRESETS.map((preset) => {
          const isActive = activeProfile.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-4 rounded-2xl text-left transition border flex flex-col justify-between space-y-3 ${
                isActive
                  ? 'bg-sky-500/15 border-sky-400/70 shadow-[0_0_24px_-8px_rgba(56,189,248,0.45)]'
                  : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-white">
                    {language === 'hi' ? preset.nameHi : preset.nameEn}
                  </span>
                  {isActive && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-sky-400 text-slate-950 flex-shrink-0">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{preset.locationName}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-300">
                {preset.members.hasToddler && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10">
                    <Baby className="w-3 h-3" /> Toddler
                  </span>
                )}
                {preset.members.hasElderly && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10">
                    <HeartPulse className="w-3 h-3" /> Elderly
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10">
                  <Bike className="w-3 h-3" /> {preset.commuteMode}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    preset.homeSetup.hasPurifier
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {preset.homeSetup.hasPurifier ? 'HEPA Purifier' : 'No Purifier'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {isEditing && (
        <CustomProfileModal
          initialProfile={activeProfile}
          onSave={handleSaveEdit}
          onClose={() => setIsEditing(false)}
        />
      )}
    </section>
  );
}

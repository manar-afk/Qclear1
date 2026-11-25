'use client';

import React, { useState } from 'react';
import { HouseholdProfile } from '@/constants/presets';
import { usePreferences } from '@/context/PreferencesContext';
import { X } from 'lucide-react';

interface CustomProfileModalProps {
  initialProfile: HouseholdProfile;
  onSave: (profile: HouseholdProfile) => void;
  onClose: () => void;
}

/**
 * Modal for customizing household location, vulnerable members, commute mode, and purifier setup.
 */
export function CustomProfileModal({ initialProfile, onSave, onClose }: CustomProfileModalProps) {
  const { language } = usePreferences();
  const [editForm, setEditForm] = useState<HouseholdProfile>(initialProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editForm);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={language === 'hi' ? 'परिवार प्रोफाइल अनुकूलित करें' : 'Customize Household Profile'}
    >
      <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-100">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-lg font-bold text-white">
            {language === 'hi' ? 'परिवार प्रोफाइल अनुकूलित करें' : 'Customize Household Profile'}
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Profile Name / Location
            </label>
            <input
              type="text"
              value={editForm.locationName}
              onChange={(e) => setEditForm({ ...editForm, locationName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              Vulnerable Members
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.members.hasToddler}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      members: { ...editForm.members, hasToddler: e.target.checked },
                    })
                  }
                  className="rounded border-white/20 text-sky-500 focus:ring-sky-400 w-4 h-4"
                />
                <span>Toddler / Infants</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.members.hasElderly}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      members: { ...editForm.members, hasElderly: e.target.checked },
                    })
                  }
                  className="rounded border-white/20 text-sky-500 focus:ring-sky-400 w-4 h-4"
                />
                <span>Elderly (65+)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.members.hasRespiratorySensitivity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      members: { ...editForm.members, hasRespiratorySensitivity: e.target.checked },
                    })
                  }
                  className="rounded border-white/20 text-sky-500 focus:ring-sky-400 w-4 h-4"
                />
                <span>Asthma / Respiratory Sensitivity</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Primary Commute Mode
            </label>
            <select
              value={editForm.commuteMode}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  commuteMode: e.target.value as HouseholdProfile['commuteMode'],
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="two_wheeler">Motorized Two-Wheeler / Scooter</option>
              <option value="car">Car (AC Recirculate)</option>
              <option value="transit">Metro / Public Bus</option>
              <option value="remote">Work from Home / Remote</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hasPurifier"
              checked={editForm.homeSetup.hasPurifier}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  homeSetup: { ...editForm.homeSetup, hasPurifier: e.target.checked },
                })
              }
              className="rounded border-white/20 text-sky-500 focus:ring-sky-400 w-4 h-4"
            />
            <label htmlFor="hasPurifier" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Equipped with HEPA Air Purifier
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/25 transition"
            >
              Apply Tailoring
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

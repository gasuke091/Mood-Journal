import React from 'react';
import { Smile, X, Sparkles } from 'lucide-react';
import { MoodData, AVAILABLE_MOODS } from '../lib/firebase';

interface MoodSelectorProps {
  selectedMood: MoodData | null;
  onSelectMood: (mood: MoodData | null) => void;
  disabled?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  disabled = false,
}) => {
  return (
    <div id="mood-selector-container" className="pt-3 pb-1 border-t border-slate-800/80">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Smile className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>How are you feeling right now?</span>
          <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
            (Optional mood tag for emotional trend tracking)
          </span>
        </div>

        {selectedMood && !disabled && (
          <button
            id="btn-clear-mood"
            type="button"
            onClick={() => onSelectMood(null)}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded-md bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60"
            title="Clear mood selection"
          >
            <X className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Mood Options Grid */}
      <div
        id="mood-options-grid"
        role="radiogroup"
        aria-label="Select your current mood"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
      >
        {AVAILABLE_MOODS.map((m) => {
          const isSelected = selectedMood?.id === m.id;
          return (
            <button
              key={m.id}
              id={`mood-option-${m.id}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectMood(isSelected ? null : m)}
              className={`px-2.5 py-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 border-slate-800/90 text-slate-300'
              }`}
            >
              <span className="text-lg leading-none shrink-0" role="img" aria-label={m.label}>
                {m.emoji}
              </span>
              <div className="min-w-0">
                <span
                  className={`block text-xs font-medium truncate ${
                    isSelected ? 'text-cyan-300 font-bold' : 'text-slate-300'
                  }`}
                >
                  {m.label}
                </span>
                <span className={`text-[9px] block leading-tight ${
                  isSelected ? 'text-cyan-400/80' : 'text-slate-500'
                }`}>
                  {m.valence > 0 ? '+Positive' : m.valence < 0 ? '-Strain' : 'Neutral'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

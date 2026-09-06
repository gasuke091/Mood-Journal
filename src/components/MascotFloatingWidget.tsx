import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  X,
  HelpCircle,
  Lightbulb,
  HeartPulse,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { LumiMascot, MascotMood } from './LumiMascot';

interface MascotFloatingWidgetProps {
  onOpenTour: () => void;
  onOpenSafetyModal: () => void;
  onInjectPrompt?: (text: string, mode: 'reflect' | 'brainstorm' | 'summarize' | 'chat') => void;
}

const MINDFUL_TIPS = [
  {
    tip: "Write completely without editing for 2 minutes. Let raw feelings reach the page first.",
    category: "Freewriting",
    mode: "reflect" as const,
    samplePrompt: "Right now, my mind feels crowded with thoughts about... The rawest truth is that...",
  },
  {
    tip: "Separate what is in your direct control from what isn't. Energy follows focus.",
    category: "Cognitive Balance",
    mode: "brainstorm" as const,
    samplePrompt: "Looking at my current challenge, here is what is outside my control, and here is one small action I can actually take today...",
  },
  {
    tip: "Notice tension in your shoulders or jaw. Take one deep breath before continuing.",
    category: "Somatic Grounding",
    mode: "reflect" as const,
    samplePrompt: "Checking in with my body right now: I notice physical tension around my...",
  },
  {
    tip: "If a friend was in your shoes, what compassionate advice would you offer them?",
    category: "Self-Compassion",
    mode: "reflect" as const,
    samplePrompt: "If my dearest friend was facing this exact worry, I would gently remind them that...",
  },
  {
    tip: "Celebrate a tiny micro-win from today, even just drinking water or getting out of bed.",
    category: "Gratitude",
    mode: "summarize" as const,
    samplePrompt: "A small victory or quiet moment of comfort I experienced today was...",
  },
];

export const MascotFloatingWidget: React.FC<MascotFloatingWidgetProps> = ({
  onOpenTour,
  onOpenSafetyModal,
  onInjectPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [currentMood, setCurrentMood] = useState<MascotMood>('welcome');

  const activeTip = MINDFUL_TIPS[tipIndex];

  const handleCycleTip = () => {
    setTipIndex((prev) => (prev + 1) % MINDFUL_TIPS.length);
    const moods: MascotMood[] = ['idea', 'feeling', 'care', 'celebrate'];
    setCurrentMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  const handleUsePrompt = () => {
    if (onInjectPrompt) {
      onInjectPrompt(activeTip.samplePrompt, activeTip.mode);
    }
    setIsOpen(false);
  };

  return (
    <div id="lumi-floating-widget" className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Expanded Popover Card */}
      {isOpen && (
        <div
          id="lumi-expanded-menu"
          className="mb-3 w-80 rounded-2xl bg-[#0c1427]/95 border border-cyan-500/30 p-4 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">
                Lumi &bull; Mindful Companion
              </span>
            </div>
            <button
              id="btn-close-lumi-widget"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize companion"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mascot Animation & Dynamic Tip */}
          <div className="py-3 space-y-2.5">
            <div className="flex items-center gap-3">
              <LumiMascot
                mood={currentMood}
                size="sm"
                interactive={true}
                showGlow={false}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 uppercase tracking-wider">
                  {activeTip.category}
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-snug">
                  "{activeTip.tip}"
                </p>
              </div>
            </div>

            {/* Prompt Quick Inject */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] truncate italic">
                "{activeTip.samplePrompt}"
              </span>
              <button
                id="btn-lumi-use-prompt"
                type="button"
                onClick={handleUsePrompt}
                className="shrink-0 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium text-[11px] border border-cyan-500/30 transition-colors"
              >
                Use
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
            <button
              id="btn-lumi-next-tip"
              type="button"
              onClick={handleCycleTip}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next Mindful Tip</span>
            </button>

            <button
              id="btn-lumi-launch-tour"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenTour();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>How to Use ReflectAI (Tour)</span>
            </button>

            <button
              id="btn-lumi-lifelines"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSafetyModal();
              }}
              className="w-full text-center text-[11px] text-rose-400/80 hover:text-rose-300 py-1 transition-colors"
            >
              24/7 Crisis Support Resources
            </button>
          </div>
        </div>
      )}

      {/* Floating Mascot Trigger Button */}
      <button
        id="btn-lumi-trigger"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Lumi reflection assistant"
        className="group relative flex items-center gap-2.5 p-2 rounded-full bg-[#0c1427]/90 hover:bg-[#0f1b36] border border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-cyan-950/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
      >
        <LumiMascot
          mood={isOpen ? 'celebrate' : 'welcome'}
          size="sm"
          interactive={false}
          showGlow={true}
        />

        <div className="hidden sm:flex flex-col text-left pr-3">
          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
            <span>Ask Lumi</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </span>
          <span className="text-[10px] text-slate-400">
            {isOpen ? 'Close companion' : 'App tour & tips'}
          </span>
        </div>

        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 text-[9px] font-bold text-black items-center justify-center">
            ?
          </span>
        </span>
      </button>
    </div>
  );
};

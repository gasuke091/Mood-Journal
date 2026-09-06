import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Lock, ShieldCheck } from 'lucide-react';
import { LumiMascot } from './LumiMascot';

interface LumiProcessingIndicatorProps {
  mode?: 'reflect' | 'brainstorm' | 'summarize' | 'chat';
  customMessage?: string;
}

const STATUS_MESSAGES = [
  { text: 'Lumi is listening carefully to your words...', icon: Sparkles },
  { text: 'Contemplating gentle cognitive reframes & angles...', icon: Brain },
  { text: 'Synthesizing mindful guidance with AI intelligence...', icon: Sparkles },
  { text: 'Preparing encrypted entry for your private vault...', icon: Lock },
];

export const LumiProcessingIndicator: React.FC<LumiProcessingIndicatorProps> = ({
  mode = 'reflect',
  customMessage,
}) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2400);

    const elapsedTimer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(msgTimer);
      clearInterval(elapsedTimer);
    };
  }, []);

  const currentStatus = STATUS_MESSAGES[statusIndex];
  const Icon = currentStatus.icon;

  return (
    <div
      id="lumi-processing-indicator"
      className="my-6 rounded-2xl bg-gradient-to-b from-[#0c1427] to-[#080d1a] border border-cyan-500/40 p-6 shadow-xl shadow-cyan-950/40 relative overflow-hidden animate-in fade-in duration-300"
    >
      {/* Ambient Pulsing Aura Shimmer */}
      <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none animate-pulse" />

      {/* Top status bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="font-bold text-white tracking-wide">
            Talking with Lumi
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="font-mono text-[11px] text-cyan-400 uppercase tracking-wider">
            {mode} Mode
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private Vault Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{secondsElapsed}s</span>
        </div>
      </div>

      {/* Center Layout: Animated Lumi + Dynamic Status */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0 flex flex-col items-center">
          <LumiMascot
            mood="idea"
            size="md"
            showGlow={true}
            interactive={true}
            bubbleText="Reflecting..."
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2.5 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-300 text-sm font-semibold">
            <Icon className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>{customMessage || currentStatus.text}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            Lumi is analyzing emotional subtext and tailoring cognitive questions. Your thoughts are processed in memory and encrypted directly to your personal Firestore collection.
          </p>

          {/* Shimmering Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80 mt-2">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-purple-500 rounded-full animate-[shimmer_2s_infinite] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

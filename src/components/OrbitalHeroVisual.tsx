import React from 'react';
import { Sparkles, Cloud, Sun, Sprout, ShieldCheck, Lock } from 'lucide-react';

interface OrbitalHeroVisualProps {
  onSelectTheme?: (theme: string, promptText: string) => void;
}

export const OrbitalHeroVisual: React.FC<OrbitalHeroVisualProps> = ({ onSelectTheme }) => {
  const nodes = [
    {
      id: 'thoughts',
      label: 'Thoughts',
      icon: Cloud,
      iconColor: 'text-sky-400',
      pos: 'top-2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      prompt: 'Reflect on my unstructured thoughts today: what is demanding my attention, and what emotions are underneath?',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      iconColor: 'text-amber-300',
      pos: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
      prompt: 'Help me reframe a recurring obstacle I faced recently. What cognitive distortion might I be holding, and what is a wiser perspective?',
    },
    {
      id: 'growth',
      label: 'Growth',
      icon: Sprout,
      iconColor: 'text-emerald-400',
      pos: 'bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2',
      prompt: 'What are 3 small, grounded micro-habits I can practice tomorrow to align with my core values?',
    },
    {
      id: 'clarity',
      label: 'Clarity',
      icon: Sun,
      iconColor: 'text-cyan-300',
      pos: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
      prompt: 'I have multiple competing priorities right now. Help me separate the urgent noise from the genuinely important work.',
    },
  ];

  return (
    <div id="orbital-hero-container" className="relative w-full max-w-[440px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Deep Radial Glow in Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/20 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />

      {/* Outer Orbital Ring */}
      <div className="absolute w-[86%] h-[86%] rounded-full border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.15)] animate-[spin_60s_linear_infinite]" />

      {/* Mid Orbital Ring (Dashed) */}
      <div className="absolute w-[68%] h-[68%] rounded-full border border-dashed border-blue-400/30" />

      {/* Inner Glow Ring */}
      <div className="absolute w-[48%] h-[48%] rounded-full border border-cyan-300/30 bg-cyan-950/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]" />

      {/* Central Floating Glass Vault Prism */}
      <div
        id="orbital-center-prism"
        className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-slate-850/90 to-slate-950/95 border border-cyan-400/40 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-xl flex flex-col items-center justify-center p-3 text-center transition-transform hover:scale-105"
      >
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 border border-cyan-400/50 flex items-center justify-center shadow-inner mb-1.5">
          <Sprout className="w-6 h-6 text-emerald-300" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[9px] text-cyan-300">
            <Lock className="w-2.5 h-2.5" />
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-200 tracking-wide">
          ReflectAI
        </span>
        <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-0.5">
          <ShieldCheck className="w-2.5 h-2.5" /> Vault
        </span>
      </div>

      {/* Orbiting Interactive Theme Nodes */}
      {nodes.map((node) => {
        const IconComponent = node.icon;
        return (
          <button
            key={node.id}
            id={`orbital-node-${node.id}`}
            type="button"
            onClick={() => onSelectTheme && onSelectTheme(node.label, node.prompt)}
            className={`absolute z-20 ${node.pos} group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/70 shadow-lg shadow-black/40 backdrop-blur-md transition-all duration-300 hover:scale-110 cursor-pointer`}
            title={`Click to explore ${node.label} reflection prompt`}
          >
            <div className={`w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center ${node.iconColor}`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors whitespace-nowrap">
              {node.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

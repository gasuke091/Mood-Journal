import React from 'react';
import { Lock, ShieldCheck, Zap } from 'lucide-react';

export const ArchitectureCards: React.FC = () => {
  return (
    <div id="architecture-pillars-grid" className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
      {/* Pillar 1 */}
      <div
        id="card-pillar-auth"
        className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-300 shadow-md backdrop-blur-md flex flex-col justify-between"
      >
        <div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-2">
            Federated Google Auth
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Sign in securely with your Google Account. No passwords to manage, store, or compromise on external servers.
          </p>
        </div>
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] font-mono text-cyan-400/90">
          <span>OAuth 2.0</span>
          <span className="text-slate-600">&bull;</span>
          <span>OpenID Connect</span>
        </div>
      </div>

      {/* Pillar 2 */}
      <div
        id="card-pillar-isolation"
        className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 shadow-md backdrop-blur-md flex flex-col justify-between"
      >
        <div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-2">
            Owner-Bound Isolation
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Your data is encrypted and strictly scoped to your Google identity in Cloud Firestore. You&apos;re the only one who can access it.
          </p>
        </div>
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] font-mono text-emerald-400/90">
          <span>Row-Level Security</span>
          <span className="text-slate-600">&bull;</span>
          <span>Encrypted at Rest</span>
        </div>
      </div>

      {/* Pillar 3 */}
      <div
        id="card-pillar-gemini"
        className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800/80 hover:border-purple-500/30 transition-all duration-300 shadow-md backdrop-blur-md flex flex-col justify-between"
      >
        <div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-2">
            Talk to Lumi &bull; AI Companion
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Converse directly with Lumi, our mindful mascot powered by Gemini 3.6 Flash. Enjoy gentle, non-judgmental guidance with multi-tier high availability.
          </p>
        </div>
        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[11px] font-mono text-purple-400/90">
          <span>AI-Powered Mascot</span>
          <span className="text-slate-600">&bull;</span>
          <span>Gemini 3.6 Flash</span>
        </div>
      </div>
    </div>
  );
};

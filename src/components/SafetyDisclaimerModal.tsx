import React from 'react';
import {
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  X,
  ExternalLink,
  LifeBuoy,
  HeartHandshake,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="safety-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="safety-modal-content"
        className="relative w-full max-w-3xl bg-[#0c1427] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-8 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ReflectAI Safety &amp; Ethical Boundaries
              </h2>
              <p className="text-xs text-slate-400">
                Clear boundaries for your emotional wellbeing, security, and safety.
              </p>
            </div>
          </div>
          <button
            id="btn-close-safety-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-130px)] overflow-y-auto text-slate-300 text-xs sm:text-sm">
          {/* Critical Boundary Alert */}
          <div
            id="critical-boundary-callout"
            className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-start gap-3.5"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">
                ReflectAI is a self-reflection tool, NOT a substitute for professional mental health support.
              </p>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                This platform is an artificial intelligence journal intended for personal introspection and structured thought exploration. It is not licensed to provide clinical diagnoses, psychotherapy, psychiatric evaluation, medication prescriptions, or crisis de-escalation.
              </p>
            </div>
          </div>

          {/* Section 1: Immediate 24/7 Crisis Support Resources */}
          <div id="crisis-hotlines-section" className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-white font-semibold text-sm">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Immediate 24/7 Human Crisis Resources</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If you or someone you know is experiencing acute distress, self-harm urges, suicidal thoughts, or a psychiatric emergency, please connect immediately with free, confidential human professionals:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
                <span className="font-bold text-white block mb-0.5">988 Suicide &amp; Crisis Lifeline</span>
                <p className="text-slate-400 mb-2">United States &amp; Canada &bull; Toll-Free &bull; 24/7</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <a
                    href="tel:988"
                    className="inline-flex items-center gap-1 font-semibold text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" /> Call 988
                  </a>
                  <a
                    href="sms:988"
                    className="inline-flex items-center gap-1 font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition-colors"
                  >
                    Text 988
                  </a>
                  <span className="text-slate-400 py-1 text-[10px]">Press 1 for Veterans</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
                <span className="font-bold text-white block mb-0.5">Crisis Text Line</span>
                <p className="text-slate-400 mb-2">US, UK, and Canada &bull; Free &bull; 24/7 via SMS</p>
                <a
                  href="sms:741741?&body=HOME"
                  className="inline-flex items-center gap-1 font-semibold text-sky-300 hover:text-sky-200 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-md text-[11px] transition-colors"
                >
                  <MessageSquare className="w-3 h-3" /> Text HOME to 741741
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
                <span className="font-bold text-white block mb-0.5">The Trevor Project (LGBTQ Youth)</span>
                <p className="text-slate-400 mb-2">Confidential 24/7 crisis counselors</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <a
                    href="tel:18664887386"
                    className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/50 border border-amber-800/50 px-2.5 py-1 rounded-md"
                  >
                    1-866-488-7386
                  </a>
                  <span className="text-slate-400">or text START to 678-678</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
                <span className="font-bold text-white block mb-0.5">International Lifelines</span>
                <p className="text-slate-400 mb-2">Confidential support in 130+ nations</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <a
                    href="https://findahelpline.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md"
                  >
                    Find A Helpline <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href="https://www.befrienders.org"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md"
                  >
                    Befrienders <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: How ReflectAI Helps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              How ReflectAI Helps (Intended Benefits)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-white block mb-1">
                  1. Private, Non-Judgmental Space
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Articulating feelings reduces cognitive load. ReflectAI provides a zero-judgment canvas isolated to your personal Google identity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-white block mb-1">
                  2. AI Cognitive Reframing
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Explore tailored modes: <strong>Reflect</strong> mirrors cognitive patterns, <strong>Brainstorm</strong> generates next steps, and <strong>Summarize</strong> extracts key insights.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="font-semibold text-white block mb-1">
                  3. Emotional Trajectory
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mood tags visualize your emotional trajectory over time, helping you recognize triggers and celebrate milestones.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Crucial Boundaries */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Crucial Limitations &amp; What ReflectAI Cannot Do
            </h3>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
                <span className="font-bold text-amber-400 shrink-0">&bull;</span>
                <p>
                  <strong className="text-slate-200 font-semibold">NOT a Mental Health Professional:</strong> ReflectAI is an artificial intelligence model. It does not possess clinical consciousness, licensed diagnostic authority, or clinical medical training.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-2.5">
                <span className="font-bold text-amber-400 shrink-0">&bull;</span>
                <p>
                  <strong className="text-slate-200 font-semibold">No Crisis Intervention:</strong> The application cannot monitor real-time distress or dispatch emergency human help. Always use human lifelines in emergencies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <LifeBuoy className="w-4 h-4 text-slate-500" />
            <span>Lifeline support is available 24/7/365 &bull; Call or text 988</span>
          </div>
          <button
            id="btn-confirm-safety-understanding"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            I Understand &amp; Return to ReflectAI
          </button>
        </div>
      </div>
    </div>
  );
};

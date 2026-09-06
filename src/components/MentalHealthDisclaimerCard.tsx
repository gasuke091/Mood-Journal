import React from 'react';
import { Heart, LifeBuoy, PhoneCall, ChevronRight } from 'lucide-react';

interface MentalHealthDisclaimerCardProps {
  onOpenSafetyModal: () => void;
}

export const MentalHealthDisclaimerCard: React.FC<MentalHealthDisclaimerCardProps> = ({ onOpenSafetyModal }) => {
  return (
    <div id="safety-boundaries-section" className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
      {/* Card 1: Ethical Boundary & Intended Use */}
      <div
        id="card-ethical-boundary"
        className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800/80 hover:border-amber-500/30 transition-all duration-300 shadow-md backdrop-blur-md flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
              Ethical Boundary &bull; Intended Use Notice
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-2">
            A Supportive Reflection Companion &mdash; Not a Mental Health Professional
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            ReflectAI is designed to support self-reflection, clarity, and personal growth. It is an algorithmic exploration tool and does not provide medical, therapeutic, psychiatric, or crisis services.
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60">
          <button
            id="btn-learn-ethical-boundaries"
            type="button"
            onClick={onOpenSafetyModal}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Read Intended Use Boundaries</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card 2: Safety Boundaries & Crisis Lifelines */}
      <div
        id="card-crisis-lifelines"
        className="p-6 rounded-2xl bg-[#0c1427]/80 border border-slate-800/80 hover:border-rose-500/30 transition-all duration-300 shadow-md backdrop-blur-md flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
              Safety Boundaries &amp; Lifelines
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-2">
            24/7 Free &amp; Confidential Crisis Support
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            If you are experiencing acute distress, thoughts of self-harm, or a mental health emergency, you are not alone. Reach out immediately to free, confidential human crisis counselors:
          </p>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <a
              id="link-dial-988"
              href="tel:988"
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
              title="Call 988 Lifeline (Toll-Free in US & Canada)"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 988</span>
            </a>
            <a
              id="link-sms-988"
              href="sms:988"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Text 988 Lifeline"
            >
              Text 988
            </a>
          </div>

          <button
            id="btn-open-all-lifelines"
            type="button"
            onClick={onOpenSafetyModal}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>All Global Lifelines</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

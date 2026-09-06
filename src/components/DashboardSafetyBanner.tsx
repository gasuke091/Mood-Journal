import React from 'react';
import { HeartHandshake, X } from 'lucide-react';

interface DashboardSafetyBannerProps {
  onOpenSafetyModal: () => void;
  onDismiss: () => void;
}

export const DashboardSafetyBanner: React.FC<DashboardSafetyBannerProps> = ({
  onOpenSafetyModal,
  onDismiss,
}) => {
  return (
    <div
      id="dashboard-safety-banner"
      className="p-3.5 sm:p-4 rounded-2xl bg-[#0c1427]/90 border border-amber-500/30 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md backdrop-blur-md"
    >
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <HeartHandshake className="w-4 h-4" />
        </div>
        <p className="leading-relaxed text-slate-300">
          <span className="font-semibold text-amber-300">Mental Health Boundary:</span> ReflectAI is a private cognitive reflection tool, not a therapist or clinical provider. If you are experiencing distress, urge of self-harm, or need human crisis support, call or text{' '}
          <a href="tel:988" className="font-bold underline text-white hover:text-rose-400 transition-colors">
            988
          </a>{' '}
          (Free, Confidential, 24/7 Lifeline) or text{' '}
          <a href="sms:741741?&body=HOME" className="font-bold underline text-white hover:text-sky-400 transition-colors">
            HOME to 741741
          </a>.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          id="btn-banner-crisis-info"
          type="button"
          onClick={onOpenSafetyModal}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-amber-500/30 text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          Lifelines &amp; Boundaries
        </button>
        <button
          id="btn-dismiss-safety-banner"
          type="button"
          onClick={onDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss safety reminder for this session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

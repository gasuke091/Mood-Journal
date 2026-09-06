import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Brain,
  Lightbulb,
  FileText,
  MessageSquare,
  Lock,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Smile,
  Compass,
} from 'lucide-react';
import { LumiMascot, MascotMood } from './LumiMascot';

interface FirstTimeUserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStarterPrompt?: (promptText: string, mode: 'reflect' | 'brainstorm' | 'summarize' | 'chat') => void;
  onOpenSafetyModal?: () => void;
}

interface TourStep {
  id: number;
  title: string;
  subtitle: string;
  lumiMood: MascotMood;
  bubbleTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Meet Lumi & Welcome to ReflectAI',
    subtitle: 'Your private, secure sanctuary for cognitive introspection and emotional peace.',
    lumiMood: 'welcome',
    bubbleTip: 'Welcome friend! So happy you are here.',
  },
  {
    id: 2,
    title: 'Express Unedited & Tag Your Mood',
    subtitle: 'Write without self-censorship, then capture your baseline emotional state.',
    lumiMood: 'feeling',
    bubbleTip: 'Every feeling is valid and welcomed here.',
  },
  {
    id: 3,
    title: 'Choose Your Cognitive AI Engine',
    subtitle: 'Four specialized reflection modes designed to illuminate different angles of thought.',
    lumiMood: 'idea',
    bubbleTip: 'Choose how you want me to assist your thoughts!',
  },
  {
    id: 4,
    title: 'Vault Security & Strict Owner Isolation',
    subtitle: 'End-to-end encrypted transit with Google Firestore owner-bound data isolation.',
    lumiMood: 'secure',
    bubbleTip: 'Your entries belong solely to you. Always.',
  },
  {
    id: 5,
    title: 'Safety Boundaries & 24/7 Human Lifelines',
    subtitle: 'ReflectAI supports self-inquiry, but never replaces licensed mental healthcare.',
    lumiMood: 'care',
    bubbleTip: 'Your safety is our utmost priority.',
  },
  {
    id: 6,
    title: 'You are Ready! Pick a Starter or Write Free',
    subtitle: 'Select one of Lumi’s guided starter prompts or jump straight into your blank page.',
    lumiMood: 'celebrate',
    bubbleTip: 'Let’s begin your first mindful entry!',
  },
];

const STARTER_PROMPTS = [
  {
    title: 'Untangling Work & Life Overwhelm',
    description: 'Break down a swirling to-do list into calm, sequential next steps.',
    mode: 'brainstorm' as const,
    text: 'I am feeling overwhelmed by all the competing demands on my plate right now. Help me separate what is urgent from what actually matters, and find two calm next steps.',
    badge: 'Brainstorm Mode',
    color: 'amber',
  },
  {
    title: 'Gentle Perspective & Challenging Self-Doubt',
    description: 'Examine harsh inner thoughts through a compassionate, CBT-grounded lens.',
    mode: 'reflect' as const,
    text: 'I have been being hard on myself lately over a perceived mistake. I want to step back, examine whether my inner voice is being fair, and find a kinder perspective.',
    badge: 'Reflect Mode',
    color: 'cyan',
  },
  {
    title: 'Gratitude & Mindful Savoring',
    description: 'Ground yourself in recent small victories, connections, or quiet joys.',
    mode: 'summarize' as const,
    text: 'I want to pause and reflect on 3 meaningful moments or people I feel genuinely grateful for this week, and distill why they brought warmth to my day.',
    badge: 'Summarize Mode',
    color: 'emerald',
  },
];

export const FirstTimeUserOnboardingModal: React.FC<FirstTimeUserOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectStarterPrompt,
  onOpenSafetyModal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('reflectai_onboarding_completed', 'true');
        localStorage.setItem('reflectai_onboarding_date', new Date().toISOString());
      } catch (e) {
        console.warn('Could not save onboarding status to localStorage:', e);
      }
    }
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handlePickPrompt = (starter: typeof STARTER_PROMPTS[0]) => {
    if (onSelectStarterPrompt) {
      onSelectStarterPrompt(starter.text, starter.mode);
    }
    handleFinish();
  };

  return (
    <div
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#040814]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="onboarding-modal-card"
        className="relative w-full max-w-2xl rounded-2xl bg-[#0c1427] border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
              Step {currentStep.id} of {TOUR_STEPS.length}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              ReflectAI Tour &bull; Companion Guide
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-onboarding-skip"
              type="button"
              onClick={handleFinish}
              className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Skip Tour
            </button>
            <button
              id="btn-onboarding-close"
              type="button"
              onClick={handleFinish}
              aria-label="Close Tour"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Step Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Top Row: Mascot & Title */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="shrink-0 flex flex-col items-center">
              <LumiMascot
                mood={currentStep.lumiMood}
                size="lg"
                bubbleText={currentStep.bubbleTip}
                interactive={true}
              />
              <span className="mt-2 text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider">
                Lumi &bull; Thought Guardian
              </span>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentStep.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Dynamic Interactive Step Details */}
          <div className="pt-2">
            {/* Slide 1: Welcome & Pillars */}
            {currentStep.id === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Total Privacy</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Entries saved only to your authenticated account with owner-bound rules.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <Brain className="w-4 h-4" />
                    <span>Gemini 3.6 Flash</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Multi-tier resilient cognitive mirroring designed to guide healthy introspection.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Zero Judgment</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    A safe, non-judgmental space to unload stress and regain equilibrium.
                  </p>
                </div>
              </div>
            )}

            {/* Slide 2: Express & Mood Selector */}
            {currentStep.id === 2 && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-emerald-400" />
                    8-Valence Emotional Mood Selector
                  </span>
                  <span className="text-slate-400 text-[11px]">Click to explore</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Grateful', emoji: '🌱', color: 'emerald' },
                    { label: 'Calm', emoji: '🌊', color: 'cyan' },
                    { label: 'Reflective', emoji: '✨', color: 'purple' },
                    { label: 'Energized', emoji: '⚡', color: 'amber' },
                    { label: 'Anxious', emoji: '🌪️', color: 'orange' },
                    { label: 'Exhausted', emoji: '💤', color: 'blue' },
                    { label: 'Overwhelmed', emoji: '🔥', color: 'rose' },
                    { label: 'Down / Low', emoji: '🌧️', color: 'indigo' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-200"
                    >
                      <span className="text-sm">{item.emoji}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Tagging how you feel helps the AI tailor its tone and builds your personal Emotional Trends history over time.
                </p>
              </div>
            )}

            {/* Slide 3: 4 Cognitive Modes */}
            {currentStep.id === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <Brain className="w-4 h-4" />
                    <span>Reflect Mode (CBT Mirror)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Encourages self-compassion, identifies negative spirals, and poses gentle grounding inquiries.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Lightbulb className="w-4 h-4" />
                    <span>Brainstorm Mode</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Transforms swirling thoughts into concrete, actionable steps and low-friction solutions.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/20 space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                    <FileText className="w-4 h-4" />
                    <span>Summarize Mode</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Synthesizes lengthy brain-dumps into core themes, key takeaways, and emotional patterns.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <MessageSquare className="w-4 h-4" />
                    <span>Multi-Turn Chat</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Engage in a continuous, mindful back-and-forth dialogue to explore layered situations deeply.
                  </p>
                </div>
              </div>
            )}

            {/* Slide 4: Vault Security */}
            {currentStep.id === 4 && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <Lock className="w-4 h-4" />
                  <span>Cloud Firestore Owner-Bound Security Architecture</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your reflections are never pooled or mixed with other users. Our production Firestore rules strictly mandate:
                </p>
                <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 font-mono text-[11px] text-cyan-300">
                  match /users/{'{userId}'}/interactions/{'{interactionId}'} {'{'}
                  <br />
                  &nbsp;&nbsp;allow read, write: if request.auth != null &amp;&amp; request.auth.uid == userId;
                  <br />
                  {'}'}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No Model Training
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> TLS 1.3 Encryption
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Hard-Delete
                  </span>
                </div>
              </div>
            )}

            {/* Slide 5: Safety & Crisis Lifelines */}
            {currentStep.id === 5 && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-rose-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4" />
                    Important Clinical Boundaries
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenSafetyModal) onOpenSafetyModal();
                    }}
                    className="text-xs text-rose-300 underline hover:text-white transition-colors"
                  >
                    View All Lifeline Numbers
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ReflectAI is strictly an algorithmic writing mirror. It cannot diagnose, prescribe, or handle emotional emergencies.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">988 Lifeline</div>
                      <div className="text-[11px] text-slate-400">Free, confidential 24/7 call or text</div>
                    </div>
                    <span className="font-mono font-bold text-rose-400">Call 988</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">Crisis Text Line</div>
                      <div className="text-[11px] text-slate-400">Text support with real humans</div>
                    </div>
                    <span className="font-mono font-bold text-rose-400">Text HOME to 741741</span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 6: Starter Prompts */}
            {currentStep.id === 6 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 font-medium">
                  Click any of Lumi’s hand-crafted starter prompts to load it straight into the journal composer:
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {STARTER_PROMPTS.map((starter, idx) => (
                    <button
                      key={idx}
                      id={`btn-starter-prompt-${idx}`}
                      type="button"
                      onClick={() => handlePickPrompt(starter)}
                      className="text-left p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-cyan-500/40 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {starter.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {starter.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        "{starter.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer: Controls & Dots */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-[#080d1c] flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                aria-label={`Go to slide ${step.id}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-6 bg-cyan-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Buttons: Back / Next / Finish */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <button
                id="btn-onboarding-prev"
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {isLastStep ? (
              <button
                id="btn-onboarding-finish"
                type="button"
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all font-medium"
              >
                <span>Start Reflecting Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-onboarding-next"
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-colors"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
  saveUserInteraction,
  fetchUserInteractions,
  deleteUserInteraction,
  InteractionRecord,
  MoodData,
  User,
} from './lib/firebase';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  LogOut,
  Send,
  BookOpen,
  RotateCcw,
  Trash2,
  Brain,
  FileText,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Database,
  ExternalLink,
  HeartPulse,
  HeartHandshake,
  PhoneCall,
  LifeBuoy,
  Info,
  Copy,
  Volume2,
  VolumeX,
  Search,
  Check,
  Sprout,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SafetyDisclaimerModal } from './components/SafetyDisclaimerModal';
import { MentalHealthDisclaimerCard } from './components/MentalHealthDisclaimerCard';
import { DashboardSafetyBanner } from './components/DashboardSafetyBanner';
import { MoodSelector } from './components/MoodSelector';
import { EmotionalTrendsTracker } from './components/EmotionalTrendsTracker';
import { OrbitalHeroVisual } from './components/OrbitalHeroVisual';
import { ArchitectureCards } from './components/ArchitectureCards';
import { SystemStatusModal } from './components/SystemStatusModal';
import { InfoModals, ModalType } from './components/InfoModals';
import { FirstTimeUserOnboardingModal } from './components/FirstTimeUserOnboardingModal';
import { MascotFloatingWidget } from './components/MascotFloatingWidget';
import { LumiMascot } from './components/LumiMascot';
import { LumiProcessingIndicator } from './components/LumiProcessingIndicator';
import { VoiceInputButton } from './components/VoiceInputButton';

type WorkspaceTab = 'home' | 'journal' | 'insights' | 'security' | 'safety';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Modals state
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [showSystemStatusModal, setShowSystemStatusModal] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<ModalType>(null);
  const [dismissSafetyBanner, setDismissSafetyBanner] = useState<boolean>(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState<boolean>(false);

  // First-time user onboarding detection: auto-open if not seen yet
  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem('reflectai_onboarding_completed');
      if (!hasCompleted) {
        // Small delay so initial canvas paints smoothly before welcoming the user
        const timer = setTimeout(() => {
          setShowOnboardingTour(true);
        }, 750);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('LocalStorage error checking onboarding state:', e);
    }
  }, []);

  // Active view & navigation
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Journaling & Reflection state
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<'reflect' | 'summarize' | 'brainstorm' | 'chat'>('reflect');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<string | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  // Emotional Mood state
  const [selectedMood, setSelectedMood] = useState<MoodData | null>(null);
  const [activeMoodFilter, setActiveMoodFilter] = useState<string | null>(null);

  // Persistence & History state
  const [history, setHistory] = useState<InteractionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<InteractionRecord | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastFailedPayload, setLastFailedPayload] = useState<any | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'reflect' | 'summarize' | 'brainstorm' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio & Copy utilities
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Multi-turn active conversation context for current thread
  const [activeThread, setActiveThread] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);

  const loadUserHistory = useCallback(async (userOrUserId?: User | string | null) => {
    let activeUser: User | null = null;
    if (userOrUserId && typeof userOrUserId === 'object' && 'getIdToken' in userOrUserId) {
      activeUser = userOrUserId as User;
    } else {
      activeUser = currentUser;
    }
    if (!activeUser) return;
    setHistoryLoading(true);
    try {
      const records = await fetchUserInteractions(activeUser.uid, 50);
      setHistory(records || []);
    } catch (err: any) {
      console.error('Failed to load past entries via Firestore SDK:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [currentUser]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        loadUserHistory(user);
      } else {
        setHistory([]);
        setSelectedEntry(null);
        setActiveThread([]);
        setCurrentResponse(null);
      }
    });
    return () => unsubscribe();
  }, [loadUserHistory]);

  // Dynamic greeting based on current local hour
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', icon: '🌅' };
    if (hour < 18) return { text: 'Good afternoon', icon: '☀️' };
    return { text: 'Good evening', icon: '🌙' };
  }, []);

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err?.message || 'Failed to authenticate via Google Sign-In.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Submit Reflection to Gemini & Commit to Firestore
  const handleSubmitReflection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || !currentUser || isGenerating) return;

    const userPrompt = prompt.trim();
    setIsGenerating(true);
    setGenerationError(null);
    setSaveStatus('idle');

    try {
      const idToken = await currentUser.getIdToken();

      // 1. Send request to Server-Side Resilient Gemini Gateway
      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          mode,
          history: activeThread,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server returned an error generating reflection.');
      }

      const replyText = data.text;
      const model = data.modelUsed || 'gemini-3.6-flash';
      const duration = data.durationMs || 0;

      setCurrentResponse(replyText);
      setLastModelUsed(model);
      setLastDurationMs(duration);

      // Update in-memory multi-turn thread
      const updatedThread = [
        ...activeThread,
        { role: 'user' as const, content: userPrompt },
        { role: 'model' as const, content: replyText },
      ];
      setActiveThread(updatedThread);

      // 2. Guaranteed Transaction Verification: Save via Firestore SDK
      setSaveStatus('saving');
      const payloadToSave = {
        userEmail: currentUser.email,
        prompt: userPrompt,
        geminiResponse: replyText,
        mode,
        modelUsed: model,
        durationMs: duration,
        createdAt: Date.now(),
        title: userPrompt.slice(0, 45) + (userPrompt.length > 45 ? '...' : ''),
        mood: selectedMood,
      };

      try {
        const docId = await saveUserInteraction(currentUser.uid, payloadToSave);
        setSaveStatus('saved');
        setLastFailedPayload(null);
        // Add to history state
        const newRecord: InteractionRecord = {
          id: docId,
          userId: currentUser.uid,
          ...payloadToSave,
        };
        setHistory((prev) => [newRecord, ...prev]);
        setPrompt(''); // Only clear prompt buffer on confirmed write
        setSelectedMood(null);
      } catch (saveErr: any) {
        console.error('Firestore save failed:', saveErr);
        setSaveStatus('error');
        setLastFailedPayload(payloadToSave);
      }
    } catch (err: any) {
      console.error('Reflection submission failed:', err);
      setGenerationError(err?.message || 'Failed to generate reflection. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetrySave = async () => {
    if (!lastFailedPayload || !currentUser) return;
    setSaveStatus('saving');
    try {
      const docId = await saveUserInteraction(currentUser.uid, lastFailedPayload);
      setSaveStatus('saved');
      const newRecord: InteractionRecord = {
        id: docId,
        userId: currentUser.uid,
        ...lastFailedPayload,
      };
      setHistory((prev) => [newRecord, ...prev]);
      setLastFailedPayload(null);
      setPrompt('');
    } catch (err: any) {
      console.error('Retry save failed:', err);
      setSaveStatus('error');
    }
  };

  const handleDeleteEntry = async (id?: string) => {
    if (!id || !currentUser) return;
    if (!window.confirm('Delete this entry permanently from Firestore?')) return;

    try {
      await deleteUserInteraction(currentUser.uid, id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    } catch (err: any) {
      console.error('Failed to delete interaction:', err);
      alert('Failed to delete entry: ' + (err?.message || err));
    }
  };

  const handleStartNewThread = () => {
    setActiveThread([]);
    setCurrentResponse(null);
    setSelectedEntry(null);
    setPrompt('');
    setSelectedMood(null);
    setGenerationError(null);
    setSaveStatus('idle');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Text-to-speech reflection playback
  const handleToggleSpeech = (textToRead: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Copy response text
  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Prepopulate prompt from hero orbital nodes
  const handleHeroOrbitalSelect = (theme: string, promptText: string) => {
    setPrompt(promptText);
    setActiveWorkspaceTab('home');
    if (!currentUser) {
      handleSignIn();
    }
  };

  // Filtered entries for journal tab & sidebar
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesMode = historyFilter === 'all' || item.mode === historyFilter;
      const matchesMood = !activeMoodFilter || item.mood?.id === activeMoodFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.geminiResponse.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMode && matchesMood && matchesSearch;
    });
  }, [history, historyFilter, activeMoodFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Ambient Cosmic Background Orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-purple-700/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-[#060b18]/85 backdrop-blur-md border-b border-slate-800/80 transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Sprout className="w-5 h-5 text-emerald-300" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[8px] text-cyan-300">
                <Lock className="w-2 h-2" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">ReflectAI</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Isolated Vault
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Private by design. Built for clarity.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              id="nav-how-it-works"
              type="button"
              onClick={() => setActiveInfoModal('how-it-works')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <button
              id="nav-security"
              type="button"
              onClick={() => setActiveInfoModal('security')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Security
            </button>
            <button
              id="nav-safety"
              type="button"
              onClick={() => setShowSafetyModal(true)}
              className="hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              Safety
            </button>
            <button
              id="nav-pricing"
              type="button"
              onClick={() => setActiveInfoModal('pricing')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              id="nav-faq"
              type="button"
              onClick={() => setActiveInfoModal('faq')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              id="nav-about"
              type="button"
              onClick={() => setActiveInfoModal('about')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Controls: System Status & User Actions */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <button
              id="btn-system-status-pill"
              type="button"
              onClick={() => setShowSystemStatusModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-850 border border-slate-700/70 text-[11px] font-medium text-slate-300 transition-colors cursor-pointer"
              title="View live system telemetry"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>System Status</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">
                    {currentUser.displayName || 'Authenticated User'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentUser.email}
                  </span>
                </div>
                {currentUser.photoURL ? (
                  <img
                    id="user-avatar"
                    src={currentUser.photoURL}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-300">
                    {(currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  id="btn-sign-out"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-header-sign-in"
                onClick={handleSignIn}
                disabled={authLoading}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center gap-2 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-900" />
                <span>Continue with Google Account</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="btn-mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#0c1427] px-4 py-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveInfoModal('how-it-works');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-left text-slate-300"
              >
                How it Works
              </button>
              <button
                onClick={() => {
                  setActiveInfoModal('security');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-left text-slate-300"
              >
                Security &amp; Threat Model
              </button>
              <button
                onClick={() => {
                  setShowSafetyModal(true);
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-left text-rose-300"
              >
                Safety &amp; Lifelines (988)
              </button>
              <button
                onClick={() => {
                  setActiveInfoModal('pricing');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-left text-slate-300"
              >
                Pricing &amp; Hosting
              </button>
              <button
                onClick={() => {
                  setActiveInfoModal('faq');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-left text-slate-300"
              >
                FAQ
              </button>
              <button
                onClick={() => {
                  setActiveInfoModal('about');
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-900 text-left text-slate-300"
              >
                About ReflectAI
              </button>
            </div>
            <button
              onClick={() => {
                setShowSystemStatusModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 rounded-lg bg-slate-800 text-center font-semibold text-emerald-400"
            >
              View System Status
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
        {!currentUser ? (
          /* =========================================================================
             LANDING / PROOF-OF-CONCEPT SCREEN (MATCHING IMAGE.PNG TOP HALF)
             ========================================================================= */
          <div id="landing-hero-container" className="space-y-12 py-4">
            {/* Hero Section: Left Copy & Right Orbital Hologram */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Description & Google Sign-In */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Security Badge Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>OWASP Top 10 Compliant &bull; 4-Tier Model Fallback &bull; Zero-Insecure Defaults</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Private AI Journaling &amp; <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300">
                    Cognitive Reflection
                  </span>
                </h1>

                {/* Subtitle / Intro */}
                <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                  Talk with Lumi, our AI-powered mindful reflection companion. Explore your thoughts in a private, encrypted sanctuary isolated to your personal Google identity in Cloud Firestore.
                </p>

                {/* Call to Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <button
                    id="btn-landing-google-login"
                    onClick={handleSignIn}
                    disabled={authLoading}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{authLoading ? 'Connecting...' : 'Continue with Google Account'}</span>
                  </button>

                  <button
                    id="btn-learn-how-it-works"
                    type="button"
                    onClick={() => setActiveInfoModal('how-it-works')}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>How it Works</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    id="btn-landing-tour"
                    type="button"
                    onClick={() => setShowOnboardingTour(true)}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Meet Lumi &amp; Take Tour</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Lock className="w-3 h-3" /> Private. Secure. Yours alone.
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span>No passwords to store</span>
                </div>

                {authError && (
                  <div
                    id="auth-error-banner"
                    className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Holographic Orbital Visual */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <OrbitalHeroVisual onSelectTheme={handleHeroOrbitalSelect} />
              </div>
            </div>

            {/* Architecture Cards Section (3 Pillars from image.png) */}
            <ArchitectureCards />

            {/* Safety & Ethical Boundaries (2 Cards from image.png) */}
            <MentalHealthDisclaimerCard onOpenSafetyModal={() => setShowSafetyModal(true)} />
          </div>
        ) : (
          /* =========================================================================
             AUTHENTICATED DASHBOARD WORKSPACE (MATCHING IMAGE.PNG WORKSPACE)
             ========================================================================= */
          <div id="authenticated-workspace" className="space-y-6">
            {/* Dashboard Safety Reminder Banner */}
            {!dismissSafetyBanner && (
              <DashboardSafetyBanner
                onOpenSafetyModal={() => setShowSafetyModal(true)}
                onDismiss={() => setDismissSafetyBanner(true)}
              />
            )}

            {/* Main Workspace Layout with Sidebar Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Workspace Navigation Sidebar (3 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-[#0c1427]/80 rounded-2xl border border-slate-800/80 p-4 shadow-lg backdrop-blur-md space-y-2">
                  <div className="px-2 py-1.5 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Workspace Navigation</span>
                    <span className="font-mono text-cyan-400 text-[10px]">v2.4</span>
                  </div>

                  <button
                    id="tab-btn-home"
                    type="button"
                    onClick={() => setActiveWorkspaceTab('home')}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeWorkspaceTab === 'home'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span>Write &amp; Reflect</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="tab-btn-journal"
                    type="button"
                    onClick={() => setActiveWorkspaceTab('journal')}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeWorkspaceTab === 'journal'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Journal History</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
                      {history.length}
                    </span>
                  </button>

                  <button
                    id="tab-btn-insights"
                    type="button"
                    onClick={() => setActiveWorkspaceTab('insights')}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeWorkspaceTab === 'insights'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Emotional Insights</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    id="tab-btn-security"
                    type="button"
                    onClick={() => setActiveWorkspaceTab('security')}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeWorkspaceTab === 'security'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span>Security &amp; Rules</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[9px] text-emerald-300 font-mono">
                      Strict
                    </span>
                  </button>
                </div>

                {/* Quick Stats Widget in Sidebar */}
                <div className="bg-[#0c1427]/80 rounded-2xl border border-slate-800/80 p-4 shadow-lg backdrop-blur-md space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Cloud Vault Storage
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Owner Identity:</span>
                    <span className="font-mono text-cyan-300 truncate max-w-[120px]">
                      {currentUser.uid.slice(0, 10)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Reflections:</span>
                    <span className="font-bold text-white">{history.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Firestore Isolation:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Enforced
                    </span>
                  </div>
                </div>
              </div>

              {/* Workspace Main Canvas (9 cols) */}
              <div className="lg:col-span-9 space-y-6">
                {/* Active Tab: Home (Write & Reflect) */}
                {activeWorkspaceTab === 'home' && (
                  <div className="space-y-6">
                    {/* Top Greeting Card */}
                    <div className="bg-gradient-to-r from-[#0c1427]/90 via-[#0e1834]/80 to-[#0c1427]/90 rounded-2xl border border-slate-800/80 p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-white">
                          <span>
                            {timeGreeting.text},{' '}
                            {currentUser.displayName?.split(' ')[0] || 'Reflector'}{' '}
                            {timeGreeting.icon}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Welcome back. How would you like to reflect with Lumi today?
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs font-semibold">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          Private Vault
                        </span>
                      </div>
                    </div>

                    {/* Quick Mode Selector Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => setMode('reflect')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          mode === 'reflect'
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-[#0c1427]/80 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <Brain className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-0.5">Reflect</h4>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Explore thoughts with Lumi for personal clarity.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('brainstorm')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          mode === 'brainstorm'
                            ? 'bg-purple-500/15 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'bg-[#0c1427]/80 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-0.5">Brainstorm</h4>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Generate ideas &amp; next steps with Lumi.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('summarize')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          mode === 'summarize'
                            ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-[#0c1427]/80 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-0.5">Summarize</h4>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Extract key takeaways &amp; decisions with Lumi.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMode('chat')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          mode === 'chat'
                            ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-[#0c1427]/80 hover:bg-slate-850 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-0.5">Multi-Turn</h4>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Iterative cognitive dialogue with Lumi.
                        </p>
                      </button>
                    </div>

                    {/* Journal Composer Box */}
                    <div
                      id="composer-card"
                      className="bg-[#0c1427]/90 rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            What&apos;s on your mind?
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{prompt.length} / 20,000 chars</span>
                          {activeThread.length > 0 && (
                            <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono">
                              Thread ({activeThread.length / 2} turns)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Prompt Chips */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Prompt Ideas:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPrompt(
                              'Today I encountered an obstacle with a project milestone. What lessons can I extract to improve execution?'
                            )
                          }
                          className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Obstacle &amp; Learning
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPrompt(
                              'I have three competing priorities this week. Help me structure a calm, decisive approach.'
                            )
                          }
                          className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Decision Prioritization
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPrompt(
                              'Reflect on what I am deeply grateful for today, and outline 3 clear intentions for tomorrow.'
                            )
                          }
                          className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Gratitude &amp; Intentions
                        </button>
                      </div>

                      {/* Composer Textarea */}
                      <form onSubmit={handleSubmitReflection} className="space-y-4">
                        <textarea
                          id="journal-input"
                          rows={6}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={
                            mode === 'reflect'
                              ? 'Talk to Lumi about what is on your mind today... your thoughts, feelings, or dilemmas.'
                              : mode === 'summarize'
                              ? 'Share notes, thoughts, or daily logs with Lumi for structured clarity...'
                              : mode === 'brainstorm'
                              ? 'Describe a challenge or project you want creative ideas and next steps from Lumi...'
                              : 'Chat with Lumi... speak your mind or write freely...'
                          }
                          className="w-full p-4 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all resize-y"
                        />

                        {/* Mood Selector Component */}
                        <MoodSelector
                          selectedMood={selectedMood}
                          onSelectMood={setSelectedMood}
                          disabled={isGenerating}
                        />

                        {/* Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <VoiceInputButton
                              onTranscriptChunk={(chunk) =>
                                setPrompt((prev) => (prev ? prev + ' ' + chunk : chunk))
                              }
                              disabled={isGenerating}
                            />
                            {activeThread.length > 0 && (
                              <button
                                id="btn-reset-thread"
                                type="button"
                                onClick={handleStartNewThread}
                                className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>New Thread</span>
                              </button>
                            )}
                          </div>

                          <button
                            id="btn-submit-reflection"
                            type="submit"
                            disabled={isGenerating || !prompt.trim()}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            {isGenerating ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>Reflecting with Lumi...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                                <span>Send to Lumi</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Real-time Mindful Processing Indicator */}
                      {isGenerating && (
                        <div className="pt-2">
                          <LumiProcessingIndicator mode={mode} />
                        </div>
                      )}

                      {/* Error & Save Feedback Banners */}
                      {generationError && (
                        <div
                          id="generation-error"
                          className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>{generationError}</span>
                        </div>
                      )}

                      {saveStatus === 'error' && (
                        <div
                          id="save-error-banner"
                          className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                            <span>
                              Lumi generated response, but Firestore persistence encountered an issue. Input preserved.
                            </span>
                          </div>
                          <button
                            id="btn-retry-save"
                            type="button"
                            onClick={handleRetrySave}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                          >
                            Retry Save
                          </button>
                        </div>
                      )}

                      {saveStatus === 'saved' && (
                        <div
                          id="save-success-banner"
                          className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Reflection verified and securely stored in your personal Cloud Firestore vault!</span>
                        </div>
                      )}
                    </div>

                    {/* Active Reflection Output Viewer */}
                    {(currentResponse || selectedEntry) && (
                      <div
                        id="reflection-output-card"
                        className="bg-[#0c1427]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl backdrop-blur-md space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold text-white">
                              {selectedEntry ? `Archived Reflection: ${selectedEntry.title}` : "Lumi's Cognitive Reflection"}
                            </h3>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
                              {selectedEntry ? selectedEntry.modelUsed : lastModelUsed || 'gemini-3.6-flash'}
                            </span>
                            {(selectedEntry?.durationMs || lastDurationMs) && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3" />
                                {selectedEntry?.durationMs || lastDurationMs}ms
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Logged Mood Badge */}
                        {(selectedEntry?.mood || (!selectedEntry && selectedMood)) && (
                          <div id="reflection-mood-badge-row" className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">Tagged State:</span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                              <span>{(selectedEntry?.mood || selectedMood)?.emoji}</span>
                              <span>{(selectedEntry?.mood || selectedMood)?.label}</span>
                            </span>
                          </div>
                        )}

                        {/* User Prompt Box */}
                        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Your Prompt / Journal Entry
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {selectedEntry ? selectedEntry.prompt : activeThread[activeThread.length - 2]?.content || prompt}
                          </p>
                        </div>

                        {/* Gemini Response Body (Rendered with ReactMarkdown) */}
                        <div className="p-5 rounded-xl bg-slate-950/90 border border-cyan-500/20 text-slate-200 text-sm leading-relaxed">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              Lumi&apos;s Perspective &amp; Reflection
                            </span>

                            {/* Audio & Copy Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleSpeech(
                                    selectedEntry ? selectedEntry.geminiResponse : currentResponse || ''
                                  )
                                }
                                className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                title={isSpeaking ? 'Stop listening' : 'Listen to reflection (TTS)'}
                              >
                                {isSpeaking ? (
                                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                  <Volume2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    selectedEntry ? selectedEntry.geminiResponse : currentResponse || ''
                                  )
                                }
                                className="p-1 rounded hover:bg-slate-850 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                                title="Copy reflection to clipboard"
                              >
                                {copiedResponse ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-white prose-a:text-cyan-400">
                            <ReactMarkdown>
                              {selectedEntry ? selectedEntry.geminiResponse : currentResponse || ''}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {selectedEntry && (
                          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                            <span>
                              Saved on {new Date(selectedEntry.createdAt).toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteEntry(selectedEntry.id)}
                              className="px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete from Firestore</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Active Tab: Journal (Browse History & Manage Entries) */}
                {activeWorkspaceTab === 'journal' && (
                  <div className="bg-[#0c1427]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl backdrop-blur-md space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                          Your Private Journal Vault
                        </h3>
                        <p className="text-xs text-slate-400">
                          {history.length} total encrypted entries stored under /users/{currentUser.uid.slice(0, 8)}...
                        </p>
                      </div>

                      <button
                        id="btn-refresh-journal"
                        type="button"
                        onClick={() => loadUserHistory(currentUser.uid)}
                        disabled={historyLoading}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Search & Mode Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-7 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search journal entries..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="sm:col-span-5 flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                        {(['all', 'reflect', 'summarize', 'brainstorm', 'chat'] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setHistoryFilter(filter)}
                            className={`px-2.5 py-1.5 rounded-lg capitalize whitespace-nowrap font-medium transition-colors cursor-pointer ${
                              historyFilter === filter
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Entries List */}
                    <div className="space-y-3">
                      {historyLoading && history.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500">
                          Fetching your encrypted entries from Cloud Firestore...
                        </div>
                      ) : filteredHistory.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                          <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                          <p>No journal entries found matching current criteria.</p>
                          <button
                            type="button"
                            onClick={() => setActiveWorkspaceTab('home')}
                            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-block"
                          >
                            Write New Reflection
                          </button>
                        </div>
                      ) : (
                        filteredHistory.map((item) => (
                          <div
                            key={item.id}
                            id={`history-item-${item.id}`}
                            className="p-4 rounded-xl bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all cursor-pointer space-y-2"
                            onClick={() => {
                              setSelectedEntry(item);
                              setActiveWorkspaceTab('home');
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono">
                                  {item.mode}
                                </span>
                                {item.mood && (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                    <span>{item.mood.emoji}</span>
                                    <span>{item.mood.label}</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-white line-clamp-2">
                              {item.prompt}
                            </p>

                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {item.geminiResponse}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                              <span>Model: {item.modelUsed}</span>
                              <span className="text-cyan-400 flex items-center gap-1">
                                Open Reflection <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Active Tab: Insights (Emotional Trends Tracker) */}
                {activeWorkspaceTab === 'insights' && (
                  <div className="space-y-6">
                    <EmotionalTrendsTracker
                      history={history}
                      activeMoodFilter={activeMoodFilter}
                      onSelectMoodFilter={setActiveMoodFilter}
                      onSelectEntry={(entry) => {
                        setSelectedEntry(entry);
                        setActiveWorkspaceTab('home');
                      }}
                    />
                  </div>
                )}

                {/* Active Tab: Security Posture & Threat Model */}
                {activeWorkspaceTab === 'security' && (
                  <div className="bg-[#0c1427]/90 rounded-2xl border border-slate-800/90 p-6 shadow-xl backdrop-blur-md space-y-6 text-slate-300">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-base font-bold text-white">Security &amp; Firestore Isolation Rules</h3>
                        <p className="text-xs text-slate-400">Strict owner-bound path verification</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Zero Insecure Defaults
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          No open read/write wildcards. Every document path strictly requires valid Firebase Auth JWT tokens.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                          Owner-Bound Collection
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed font-mono">
                          /users/{currentUser.uid}/interactions
                        </p>
                      </div>
                    </div>

                    {/* Firestore Security Rules Block */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Active firestore.rules Engine
                      </span>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                      </pre>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal('security')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer"
                    >
                      View Complete 5-Zone Threat Summary Table
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Trust & Guarantee Footer (Matches image.png bottom bar) */}
      <footer id="app-footer" className="mt-auto border-t border-slate-800/80 bg-[#060b18]/90 backdrop-blur-md py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs text-slate-400">
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>End-to-End TLS 1.3</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Cloud Firestore Vault</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Zero Model Training</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex items-center justify-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Permanent Delete Anytime</span>
            </div>
          </div>

          {/* Bottom Bar Details */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-800/60">
            <div className="flex flex-wrap items-center gap-3">
              <span>ReflectAI &bull; Google Cloud Run Production Workbench</span>
              <span className="text-slate-700 hidden sm:inline">&bull;</span>
              <button
                id="btn-footer-safety-link"
                type="button"
                onClick={() => setShowSafetyModal(true)}
                className="text-slate-400 hover:text-rose-400 underline cursor-pointer transition-colors"
              >
                Mental Health Lifelines (988)
              </button>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Firestore SDK Direct
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block"></span>
                Gemini 3.6 Flash Active
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <SafetyDisclaimerModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />

      <SystemStatusModal
        isOpen={showSystemStatusModal}
        onClose={() => setShowSystemStatusModal(false)}
      />

      <InfoModals
        activeModal={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
      />

      {/* 1st Time User Onboarding Overview & Mascot Tour */}
      <FirstTimeUserOnboardingModal
        isOpen={showOnboardingTour}
        onClose={() => setShowOnboardingTour(false)}
        onSelectStarterPrompt={(starterText, starterMode) => {
          setPrompt(starterText);
          setMode(starterMode);
          setActiveWorkspaceTab('home');
          setTimeout(() => {
            const composer = document.getElementById('composer-card');
            if (composer) {
              composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }}
        onOpenSafetyModal={() => setShowSafetyModal(true)}
      />

      {/* Floating Mascot (Lumi) Companion Widget */}
      <MascotFloatingWidget
        onOpenTour={() => setShowOnboardingTour(true)}
        onOpenSafetyModal={() => setShowSafetyModal(true)}
        onInjectPrompt={(tipPrompt, tipMode) => {
          setPrompt(tipPrompt);
          setMode(tipMode);
          setActiveWorkspaceTab('home');
          setTimeout(() => {
            const composer = document.getElementById('composer-card');
            if (composer) {
              composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }}
      />
    </div>
  );
}

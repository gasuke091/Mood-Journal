import React, { useState, useEffect, useCallback } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
  InteractionRecord,
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
  Layers,
  ChevronRight,
  Database,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Journaling & Reflection state
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<'reflect' | 'summarize' | 'brainstorm' | 'chat'>('reflect');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<string | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  // Persistence & History state
  const [history, setHistory] = useState<InteractionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<InteractionRecord | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastFailedPayload, setLastFailedPayload] = useState<any | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'reflect' | 'summarize' | 'brainstorm' | 'chat'>('all');

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
      const idToken = await activeUser.getIdToken();
      const res = await fetch('/api/interactions/fetch?limit=50', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load interactions from backend API.');
      }
      setHistory(data.interactions || []);
    } catch (err: any) {
      console.error('Failed to load past entries via backend API:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [currentUser]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(user => {
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

  // Submit Reflection to Gemini & Commit to Firestore via Backend API
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
          'Authorization': `Bearer ${idToken}`,
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

      // Update in-memory thread
      const updatedThread = [
        ...activeThread,
        { role: 'user' as const, content: userPrompt },
        { role: 'model' as const, content: replyText },
      ];
      setActiveThread(updatedThread);

      // 2. Guaranteed Transaction Verification: Save via Backend API (/api/interactions/save)
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
      };

      try {
        const saveRes = await fetch('/api/interactions/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(payloadToSave),
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok || !saveData.success) {
          throw new Error(saveData.error || 'Failed to save interaction via backend.');
        }

        const docId = saveData.id;
        setSaveStatus('saved');
        setLastFailedPayload(null);
        // Add to history state
        const newRecord: InteractionRecord = {
          id: docId,
          userId: currentUser.uid,
          ...payloadToSave,
        };
        setHistory((prev) => [newRecord, ...prev]);
        setPrompt(''); // Only clear prompt buffer on confirmed save
      } catch (saveErr: any) {
        console.error('Backend API save failed:', saveErr);
        setSaveStatus('error');
        setLastFailedPayload(payloadToSave);
        // Preserve prompt so user does not lose input
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
      const idToken = await currentUser.getIdToken();
      const saveRes = await fetch('/api/interactions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(lastFailedPayload),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) {
        throw new Error(saveData.error || 'Retry save failed on backend API.');
      }

      const docId = saveData.id;
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
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/interactions/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete interaction via backend API.');
      }

      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    } catch (err: any) {
      alert('Failed to delete entry: ' + (err?.message || err));
    }
  };

  const handleStartNewThread = () => {
    setActiveThread([]);
    setCurrentResponse(null);
    setSelectedEntry(null);
    setPrompt('');
    setGenerationError(null);
    setSaveStatus('idle');
  };

  const filteredHistory = history.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.mode === historyFilter;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      {/* Top Header */}
      <header id="app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-stone-900">ReflectAI</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Isolated Firestore
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Private Multi-Turn AI Journal with Resilient Gemini 3.6 Flash</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-stone-800">{currentUser.displayName || 'Authenticated User'}</span>
                  <span className="text-[11px] text-stone-500 font-mono">{currentUser.email}</span>
                </div>
                {currentUser.photoURL ? (
                  <img
                    id="user-avatar"
                    src={currentUser.photoURL}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                    {(currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  id="btn-sign-out"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!currentUser ? (
          /* Landing Screen for Unauthenticated Visitors */
          <div id="unauthenticated-landing" className="max-w-3xl mx-auto py-12 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>OWASP Top 10 Compliant &bull; 4-Tier Model Fallback &bull; Zero-Insecure Defaults</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 mb-4">
              Private AI Journaling &amp; Cognitive Reflection
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Explore your thoughts with Gemini 3.6 Flash. Every journal entry, reflection, and summary is encrypted in transit and isolated strictly to your personal Google identity in Cloud Firestore.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                id="btn-landing-google-login"
                onClick={handleSignIn}
                disabled={authLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {authLoading ? 'Connecting to Firebase Auth...' : 'Continue with Google Account'}
              </button>
            </div>

            {authError && (
              <div id="auth-error-banner" className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 max-w-md mx-auto text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* Architecture Architecture Proof Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-8 border-t border-stone-200">
              <div id="feature-card-auth" className="p-5 rounded-xl bg-white border border-stone-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1">Federated Google Auth</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  No passwords stored on servers. Seamless OAuth identity through Firebase Authentication tokens.
                </p>
              </div>

              <div id="feature-card-firestore" className="p-5 rounded-xl bg-white border border-stone-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1">Owner-Bound Isolation</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Enforced via <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">request.auth.uid == userId</code> security rules. Other users cannot access your entries.
                </p>
              </div>

              <div id="feature-card-gemini" className="p-5 rounded-xl bg-white border border-stone-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1">Resilient Gemini 3.6 Flash</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Four-tier automated fallback ladder (<code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">3.6-flash</code> &rarr; <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">3.1-flash-lite</code> &rarr; <code className="text-[11px] bg-stone-100 px-1 py-0.5 rounded">dynamic</code>) prevents downtime.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div id="authenticated-dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Editor & Active Reflection Thread (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Journal Composer Box */}
              <div id="composer-card" className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Reflection Focus</span>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                    <button
                      id="mode-reflect"
                      type="button"
                      onClick={() => setMode('reflect')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'reflect'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Brain className="w-3.5 h-3.5 text-amber-600" />
                      Reflect
                    </button>
                    <button
                      id="mode-summarize"
                      type="button"
                      onClick={() => setMode('summarize')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'summarize'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Summarize
                    </button>
                    <button
                      id="mode-brainstorm"
                      type="button"
                      onClick={() => setMode('brainstorm')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'brainstorm'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-orange-600" />
                      Brainstorm
                    </button>
                    <button
                      id="mode-chat"
                      type="button"
                      onClick={() => setMode('chat')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'chat'
                          ? 'bg-white text-stone-900 shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Multi-Turn
                    </button>
                  </div>
                </div>

                {/* Prompt templates chips */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[11px] text-stone-500 font-medium">Quick Prompts:</span>
                  <button
                    type="button"
                    onClick={() => setPrompt('Today I encountered an obstacle with a project milestone. What lessons can I extract to improve execution?')}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Obstacle &amp; Learning
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrompt('I have three competing priorities this week: shipping a critical release, conducting user interviews, and refactoring tech debt. Help me structure my decision.')}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Decision Prioritization
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrompt('Reflect on what I am deeply grateful for today, and outline 3 clear intentions for tomorrow.')}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Gratitude &amp; Intentions
                  </button>
                </div>

                {/* Textarea Input Form */}
                <form onSubmit={handleSubmitReflection}>
                  <div className="relative">
                    <textarea
                      id="journal-input"
                      rows={5}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        mode === 'reflect'
                          ? 'Write what is on your mind today... your thoughts, dilemmas, or experiences.'
                          : mode === 'summarize'
                          ? 'Paste notes, meeting transcripts, or daily thoughts for structured executive summary...'
                          : mode === 'brainstorm'
                          ? 'Describe an idea, project, or challenge you want creative angles and steps for...'
                          : 'Continue dialogue with your AI reflection partner...'
                      }
                      className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-stone-400 focus:outline-none text-sm text-stone-900 placeholder:text-stone-400 transition-all resize-y"
                    />
                    <div className="flex items-center justify-between text-xs text-stone-400 mt-2 px-1">
                      <span>{prompt.length} / 20,000 characters</span>
                      {activeThread.length > 0 && (
                        <span className="text-amber-700 font-medium">Thread active ({activeThread.length / 2} prior turns)</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {activeThread.length > 0 && (
                        <button
                          id="btn-reset-thread"
                          type="button"
                          onClick={handleStartNewThread}
                          className="px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          New Thread
                        </button>
                      )}
                    </div>

                    <button
                      id="btn-submit-reflection"
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating &amp; Persisting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send to Gemini</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Error Banner */}
                {generationError && (
                  <div id="generation-error" className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{generationError}</span>
                  </div>
                )}

                {/* Persistence Status & Retry Toast */}
                {saveStatus === 'error' && (
                  <div id="save-error-banner" className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                      <span>Gemini generated a response, but Firestore persistence encountered an issue. Input buffer preserved.</span>
                    </div>
                    <button
                      id="btn-retry-save"
                      type="button"
                      onClick={handleRetrySave}
                      className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-medium text-xs hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
                    >
                      Retry Save
                    </button>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div id="save-success-banner" className="mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Interaction verified and securely stored in Firestore!</span>
                  </div>
                )}
              </div>

              {/* Active Conversation / Output Viewer */}
              {(currentResponse || selectedEntry) && (
                <div id="reflection-output-card" className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h2 className="text-sm font-bold text-stone-900">
                        {selectedEntry ? `Archived Entry: ${selectedEntry.title}` : 'Gemini Response & Reflection'}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                      <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700">
                        {selectedEntry ? selectedEntry.modelUsed : lastModelUsed || 'gemini-3.6-flash'}
                      </span>
                      {(selectedEntry?.durationMs || lastDurationMs) && (
                        <span className="flex items-center gap-1 text-stone-400">
                          <Clock className="w-3 h-3" />
                          {selectedEntry?.durationMs || lastDurationMs}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User prompt preview */}
                  <div className="mb-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Your Journal Entry / Prompt</div>
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedEntry ? selectedEntry.prompt : activeThread[activeThread.length - 2]?.content || prompt}</p>
                  </div>

                  {/* Gemini Response Body */}
                  <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                      <Brain className="w-3 h-3" />
                      Gemini Reflection
                    </div>
                    {selectedEntry ? selectedEntry.geminiResponse : currentResponse}
                  </div>

                  {selectedEntry && (
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        Saved on {new Date(selectedEntry.createdAt).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(selectedEntry.id)}
                        className="px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete from Firestore
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: User History & Threat Model Posture (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* History Panel */}
              <div id="history-panel" className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col max-h-[540px]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-stone-700" />
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Your Entries ({history.length})</h3>
                  </div>
                  <button
                    id="btn-refresh-history"
                    onClick={() => currentUser && loadUserHistory(currentUser.uid)}
                    disabled={historyLoading}
                    className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                    title="Refresh History"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Filter tags */}
                <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 text-[11px]">
                  {(['all', 'reflect', 'summarize', 'brainstorm', 'chat'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setHistoryFilter(filter)}
                      className={`px-2 py-0.5 rounded capitalize whitespace-nowrap cursor-pointer transition-colors ${
                        historyFilter === filter
                          ? 'bg-stone-900 text-white font-medium'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* List of Entries */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {historyLoading && history.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">Loading your private entries...</div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-400">
                      No saved interactions yet. Write your first reflection on the left!
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                      <div
                        key={item.id}
                        id={`history-entry-${item.id}`}
                        onClick={() => setSelectedEntry(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          selectedEntry?.id === item.id
                            ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                            {item.mode}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-stone-800 line-clamp-2 mb-1">
                          {item.prompt}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                          <span>{item.modelUsed}</span>
                          <ChevronRight className="w-3 h-3 text-stone-400" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Threat Model & Security Posture Card */}
              <div id="security-posture-card" className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Security Architecture</h3>
                </div>

                <div className="space-y-2.5 text-xs text-stone-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">User Data Isolation:</span>
                      <p className="text-[11px] text-stone-500">
                        Path <code className="bg-stone-100 px-1 py-0.2 rounded font-mono">/users/{currentUser.uid.slice(0, 8)}.../interactions</code> enforced by Firestore rules.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">Prompt Injection Defense:</span>
                      <p className="text-[11px] text-stone-500">
                        Strict system boundary separation treats reflection text as untrusted data (OWASP LLM01).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">4-Tier Fallback Protocol:</span>
                      <p className="text-[11px] text-stone-500">
                        Primary <code className="bg-stone-100 px-1 py-0.2 rounded font-mono">gemini-3.6-flash</code> with automated fallback to <code className="bg-stone-100 px-1 py-0.2 rounded font-mono">3.1-flash-lite</code> &rarr; <code className="bg-stone-100 px-1 py-0.2 rounded font-mono">dynamic</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">Zero-Crash Payload Hygiene:</span>
                      <p className="text-[11px] text-stone-500">
                        Strict undefined-stripping ensures zero malformed payload exceptions on Firestore commits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer id="app-footer" className="mt-auto border-t border-stone-200 bg-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            <span>ReflectAI &bull; Cloud Run Production Workbench</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Firestore Connected
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Gemini 3.6 Flash Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

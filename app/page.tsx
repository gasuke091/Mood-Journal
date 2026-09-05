import React, { useState, useEffect, useCallback } from 'react';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
  InteractionRecord,
  User,
} from '../src/lib/firebase';
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
} from 'lucide-react';

export default function Page() {
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

  const loadUserHistory = useCallback(async (user?: User | null) => {
    const activeUser = user || currentUser;
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
                {authLoading ? 'Connecting to Firebase Auth...' : 'Continue with Google Account'}
              </button>
            </div>

            {authError && (
              <div id="auth-error-banner" className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 max-w-md mx-auto text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}
          </div>
        ) : (
          <div id="authenticated-dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div id="composer-card" className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Reflection Focus</span>
                  </div>

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

                <form onSubmit={handleSubmitReflection}>
                  <textarea
                    id="journal-input"
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Write what is on your mind today..."
                    className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-stone-400 focus:outline-none text-sm text-stone-900 transition-all resize-y"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      id="btn-submit-reflection"
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Gemini</span>
                    </button>
                  </div>
                </form>
              </div>

              {(currentResponse || selectedEntry) && (
                <div id="reflection-output-card" className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 text-stone-800 text-sm whitespace-pre-wrap">
                    {selectedEntry ? selectedEntry.geminiResponse : currentResponse}
                  </div>
                  {selectedEntry && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(selectedEntry.id)}
                      className="mt-4 px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div id="history-panel" className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                  <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Entries ({history.length})</h3>
                  <button
                    id="btn-refresh-history"
                    onClick={() => currentUser && loadUserHistory(currentUser)}
                    className="p-1 rounded hover:bg-stone-100 text-stone-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedEntry(item)}
                      className="p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer"
                    >
                      <p className="text-xs font-medium text-stone-800 line-clamp-2">{item.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { X, ShieldCheck, Sparkles, Brain, CheckCircle2, Lock, DollarSign, HelpCircle, Mail, Globe, ExternalLink } from 'lucide-react';

export type ModalType = 'how-it-works' | 'security' | 'pricing' | 'faq' | 'about' | 'contact' | null;

interface InfoModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div
      id={`modal-${activeModal}-overlay`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id={`modal-${activeModal}-content`}
        className="relative w-full max-w-2xl bg-[#0c1427] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-200 my-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-2.5">
            {activeModal === 'how-it-works' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">How ReflectAI Works</h3>
                  <p className="text-xs text-slate-400">The 3-stage cognitive reflection cycle</p>
                </div>
              </>
            )}

            {activeModal === 'security' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Security Architecture &amp; Threat Model</h3>
                  <p className="text-xs text-slate-400">OWASP Top 10 &amp; 5 Threat Zones posture</p>
                </div>
              </>
            )}

            {activeModal === 'pricing' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Pricing &amp; Hosting Architecture</h3>
                  <p className="text-xs text-slate-400">100% Free &amp; Open Cloud Run Tier</p>
                </div>
              </>
            )}

            {activeModal === 'faq' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Frequently Asked Questions</h3>
                  <p className="text-xs text-slate-400">Privacy, encryption, models, and data deletion</p>
                </div>
              </>
            )}

            {activeModal === 'about' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">About ReflectAI</h3>
                  <p className="text-xs text-slate-400">Cognitive clarity, privacy by design, and ethics</p>
                </div>
              </>
            )}

            {activeModal === 'contact' && (
              <>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Support &amp; Community</h3>
                  <p className="text-xs text-slate-400">Connect with the team or explore documentation</p>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Bodies */}
        <div className="text-xs sm:text-sm text-slate-300 space-y-4">
          {activeModal === 'how-it-works' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                ReflectAI combines structured journaling prompts with Gemini 3.6 Flash to transform raw, racing thoughts into balanced perspectives and actionable clarity.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Step 01</span>
                  <h4 className="font-bold text-white mb-1">Articulate &amp; Tag</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Write unedited thoughts and tag your emotional baseline with the mood selector.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Step 02</span>
                  <h4 className="font-bold text-white mb-1">Cognitive Reframe</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Gemini analyzes the entry using Socratic inquiry to identify cognitive distortions and balance emotions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Step 03</span>
                  <h4 className="font-bold text-white mb-1">Vault Isolation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Both input and reflection are verified and committed directly to your private Firestore collection path.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Supports 4 dedicated reflection engines: <strong>Reflect</strong> (mindset mirroring), <strong>Brainstorm</strong> (creative options), <strong>Summarize</strong> (distillation), and <strong>Multi-Turn</strong> (in-depth dialogue).</span>
              </div>
            </div>
          )}

          {activeModal === 'security' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                ReflectAI is engineered in compliance with OWASP Top 10 (Web) and OWASP Top 10 for LLMs. Every layer enforces zero-insecure defaults.
              </p>

              {/* Threat Summary Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 font-bold text-xs text-white">
                  Agentic Threat Matrix (The 5 Threat Zones)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                        <th className="p-2.5 font-semibold">Threat Zone</th>
                        <th className="p-2.5 font-semibold">Identified Risk</th>
                        <th className="p-2.5 font-semibold">Countermeasure Implemented</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="p-2.5 font-semibold text-cyan-400">1. Input Surfaces</td>
                        <td className="p-2.5">Oversized payloads &amp; malformed inputs</td>
                        <td className="p-2.5 text-slate-400">Strict 20,000 char validation, sanitized destructuring.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-cyan-400">2. Planning &amp; Reasoning</td>
                        <td className="p-2.5">Indirect Prompt Injection (OWASP LLM01)</td>
                        <td className="p-2.5 text-slate-400">System prompt boundary isolation; untrusted user content treated as plain data.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-cyan-400">3. Tool Execution</td>
                        <td className="p-2.5">Privilege escalation &amp; unsafe rendering</td>
                        <td className="p-2.5 text-slate-400">Client-side Firestore SDK, typed methods, markdown sanitization without raw HTML.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-cyan-400">4. Memory &amp; State</td>
                        <td className="p-2.5">Cross-user data leakage</td>
                        <td className="p-2.5 text-slate-400">Enforced owner-bound rules: <code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-[11px]">request.auth.uid == userId</code>.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-cyan-400">5. Inter-System Comm</td>
                        <td className="p-2.5">Credential leakage &amp; SSRF</td>
                        <td className="p-2.5 text-slate-400">Google Cloud Secret Manager dynamic injection; zero hardcoded tokens.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'pricing' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                ReflectAI is built entirely on serverless Google Cloud architecture designed to operate seamlessly within free tier limits:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">Cloud Run Free Tier</span>
                  <div className="text-2xl font-black text-white mb-1">$0 / mo</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Includes 2 million monthly requests, 360,000 vCPU-seconds, and automatic scale-to-zero when idle.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">Cloud Firestore Free Tier</span>
                  <div className="text-2xl font-black text-white mb-1">$0 / mo</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Includes 1 GiB stored data, 50,000 daily reads, and 20,000 daily writes per Google Cloud project.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                Deployable via standard <code className="bg-slate-850 text-slate-200 px-1.5 py-0.5 rounded font-mono">gcloud run deploy</code> with automated CI/CD.
              </div>
            </div>
          )}

          {activeModal === 'faq' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-white mb-1">Is my journal data used to train AI models?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>No.</strong> Your prompts and reflections are processed strictly through enterprise API endpoints and are never used to train public foundation models.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-white mb-1">Who can see my saved journal entries?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only you. Every entry is committed to a sub-collection <code className="bg-slate-850 px-1 rounded text-cyan-300 font-mono text-[11px]">/users/YOUR_UID/interactions</code> where Firestore security rules reject any request where <code className="bg-slate-850 px-1 rounded text-cyan-300 font-mono text-[11px]">request.auth.uid != userId</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-white mb-1">Can I delete my data at any time?</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Yes. You can delete individual reflections directly from your journal or wipe your history with immediate permanent removal.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'about' && (
            <div className="space-y-3 leading-relaxed text-slate-300">
              <p>
                ReflectAI was created to provide a sanctuary for private emotional and cognitive reflection in an era of noisy social media and algorithmic judgment.
              </p>
              <p>
                By pairing cognitive behavioral reframing principles with state-of-the-art AI reasoning, ReflectAI gives individuals an unburdened canvas to process challenges, celebrate wins, and gain actionable clarity.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>ReflectAI &bull; Cloud Run AI Security Architecture</span>
                <span className="font-mono text-cyan-400">v2.4 Production</span>
              </div>
            </div>
          )}

          {activeModal === 'contact' && (
            <div className="space-y-4">
              <p className="leading-relaxed text-slate-300">
                Have questions about deployment, security audits, or feature requests? Reach out to the project team:
              </p>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Security Inquiries:</span>
                  <span className="font-mono text-cyan-300">security@reflectai.cloud</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cloud Run Challenge Verification:</span>
                  <span className="font-mono text-cyan-300">dev-tutorial=cloud-run-ai-challenge</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

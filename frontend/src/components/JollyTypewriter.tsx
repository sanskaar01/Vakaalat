import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Edit3,
  ExternalLink,
  Gavel,
  History,
  Info,
  KeyRound,
  Mic,
  MicOff,
  PlayCircle,
  Scale,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { MoonPhaseLoader, SolutionSideArrow } from './BlissScenicBackdrop';
import { XpNotepadIcon, XpShieldIcon, XpWindow } from './XpIcons';

interface GovPortal {
  name: string;
  url: string;
  helpline?: string;
  purpose: string;
  hoverSteps: string[];
}

interface ComputedLegalAnalysis {
  detectedCategory: string;
  suggestedPostTitle: string;
  pillar1_violations: {
    totalDharasViolated: number;
    compassionateValidation: string;
    violations: {
      code: string;
      title: string;
      whyItAppliesToYourStory: string;
    }[];
  };
  pillar2_accountability: {
    jailTime: string;
    finesAndCompensation: string;
    otherRemedies: string;
  };
  pillar3_seriousness: {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    scoreOutOf10: number;
    beyondFirstAid: boolean;
    explanation: string;
    lawyerRecommendation: string;
  };
  pillar4_digitalFirstAid: {
    immediateSteps: string[];
    govPortals: GovPortal[];
  };
  youtubeGuidesWithUrls: {
    title: string;
    searchUrl: string;
    trailerText: string;
  }[];
  draftPostMasked: string;
  draftPostRaw: string;
  poweredBy: string;
  fromCache?: boolean;
}

interface SavedHistoryItem {
  id: string;
  query: string;
  category: string;
  createdAt: string;
  analysis: ComputedLegalAnalysis;
}

export const JollyTypewriter: React.FC = () => {
  const { theme, lang, token, user, t, setIsComputing, triggerScenicBurst } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [geminiReady, setGeminiReady] = useState<boolean | null>(null);
  const [result, setResult] = useState<ComputedLegalAnalysis | null>(null);
  const [history, setHistory] = useState<SavedHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredPortal, setHoveredPortal] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [needsKey, setNeedsKey] = useState(false);

  // AI Draft & Publish Modal state
  const [draftingPost, setDraftingPost] = useState(false);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftEditing, setDraftEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftCategory, setDraftCategory] = useState('Criminal');
  const [publishingPost, setPublishingPost] = useState(false);
  const [draftError, setDraftError] = useState('');

  const recognitionRef = useRef<any>(null);

  const loadHistory = () => {
    if (!token) {
      setHistory([]);
      return;
    }
    apiFetch<{ history: SavedHistoryItem[] }>('/jolly/history', {}, token)
      .then((res) => setHistory(res.history))
      .catch(() => {});
  };

  useEffect(() => {
    apiFetch<{ geminiConfigured: boolean }>('/jolly/status')
      .then((s) => setGeminiReady(s.geminiConfigured))
      .catch(() => setGeminiReady(false));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [token]);

  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t('Voice input works in Chrome/Edge. Please type your story.', 'Voice input Chrome/Edge mein chalta hai.'));
      return;
    }

    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hinglish' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      setQuery(transcript.trim());
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = query.trim();
    if (text.length < 8) {
      setError(t('Please share a few words about what happened so we can examine it with care.', 'Kripya thoda vistaar se batayein kya hua.'));
      return;
    }

    setError('');
    setNeedsKey(false);
    setLoading(true);
    setIsComputing(true);
    triggerScenicBurst(10_000);
    setResult(null);

    try {
      const res = await fetch('/api/v1/jolly/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: text, language: lang }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errorCode === 'GEMINI_KEY_REQUIRED') {
          setNeedsKey(true);
          setGeminiReady(false);
        }
        throw new Error(data.error || 'Legal analysis failed');
      }

      setResult(data as ComputedLegalAnalysis);
      setGeminiReady(true);
      loadHistory();
    } catch (err: any) {
      setError(err.message || 'Could not compute legal analysis.');
    } finally {
      setLoading(false);
      setIsComputing(false);
    }
  };

  const handleLodgeInCourt = async () => {
    if (!result) return;
    setDraftError('');
    setDraftingPost(true);
    try {
      const drafted = await apiFetch<{ title: string; body: string; category: string }>(
        '/jolly/draft-post',
        {
          method: 'POST',
          body: JSON.stringify({
            userStory: result.draftPostRaw,
            category: result.detectedCategory,
            dharas: result.pillar1_violations.violations.map((v) => v.code),
            language: lang,
          }),
        },
        token
      );
      setDraftTitle(drafted.title);
      setDraftBody(drafted.body);
      setDraftCategory(drafted.category || result.detectedCategory);
      setDraftEditing(false);
      setDraftModalOpen(true);
    } catch (err: any) {
      // Fallback to clean pre-filled draft modal if drafting call fails
      setDraftTitle(result.suggestedPostTitle);
      setDraftBody(result.draftPostRaw);
      setDraftCategory(result.detectedCategory);
      setDraftEditing(true);
      setDraftError(err.message || 'Could not auto-draft; you can edit below and post directly.');
      setDraftModalOpen(true);
    } finally {
      setDraftingPost(false);
    }
  };

  const handlePublishDraftLive = async () => {
    if (!draftTitle.trim() || draftBody.trim().length < 15) {
      setDraftError('Please make sure your post has a headline and at least a short description.');
      return;
    }

    // If not logged in yet, save the AI-drafted post and send to quick OTP signup
    if (!user || !token) {
      sessionStorage.setItem(
        'vakaalat_pending_draft',
        JSON.stringify({
          category: draftCategory,
          title: draftTitle.trim(),
          rawContent: draftBody.trim(),
        })
      );
      setDraftModalOpen(false);
      navigate('/auth?mode=register&role=client&from=jolly');
      return;
    }

    setPublishingPost(true);
    setDraftError('');
    try {
      await apiFetch(
        '/threads',
        {
          method: 'POST',
          body: JSON.stringify({
            category: draftCategory,
            title: draftTitle.trim(),
            rawContent: draftBody.trim(),
          }),
        },
        token
      );
      setDraftModalOpen(false);
      navigate('/court');
    } catch (err: any) {
      setDraftError(err.message || 'Could not publish post right now.');
    } finally {
      setPublishingPost(false);
    }
  };

  const seriousnessColors: Record<string, string> = {
    LOW: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    MODERATE: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    HIGH: 'border-orange-500/50 bg-orange-500/10 text-orange-800 dark:text-orange-300',
    CRITICAL: 'border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300',
  };

  return (
    <XpWindow
      title="Vakaalat_Legal_Engine.exe — Live Constitutional & First-Aid Analysis"
      icon={<XpNotepadIcon className="h-4 w-4 shrink-0" />}
      className="mx-auto w-full max-w-4xl"
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="xp-panel flex flex-wrap items-center justify-between gap-2 px-3.5 py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <XpShieldIcon className="h-4 w-4 shrink-0" />
            <span>
              {t(
                'Private First-Aid Legal Engine — Every story is examined live with care & respect.',
                'Private Legal Engine — Har kahani ko live aur poori izzat ke saath samjha jaata hai.'
              )}
            </span>
          </div>

          {user && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className={`xp-btn px-2.5 py-1 text-[11px] ${showHistory ? 'xp-btn-primary' : ''}`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Saved History ({history.length})</span>
            </button>
          )}
        </div>

        {/* 1-Click Reopen Saved History for Logged-in Users */}
        {user && showHistory && (
          <div className="xp-panel p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Click any past prompt to reopen its saved 4-pillar response instantly (0 extra tokens):
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">
                No saved history yet. Submit a story below and it will be saved safely to your account.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuery(item.query);
                      setResult({ ...item.analysis, fromCache: true });
                      setShowHistory(false);
                    }}
                    className="xp-btn flex-col items-start p-2.5 text-left"
                  >
                    <span className="line-clamp-1 text-xs font-bold">{item.analysis.suggestedPostTitle || item.query}</span>
                    <span className="font-mono text-[10px] opacity-75">
                      {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'Write your whole story in your own tone. Raw and real.',
              'Apni poori kahani apne andaaz mein likhein. Bilkul raw aur real.'
            )}
            className="xp-input w-full resize-none p-3.5 text-sm font-medium leading-relaxed placeholder:font-bold placeholder:text-[var(--text-secondary)]/70"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              {t(
                'Analyzed live against Indian Law & Constitution.',
                'Seedha Indian Law aur Constitution ke hisaab se live analysis.'
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`xp-btn px-3 py-1.5 text-xs ${
                  recording ? 'border-red-500 text-red-600 animate-pulse' : ''
                }`}
              >
                {recording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{recording ? t('Stop Mic', 'Rokein') : t('Record Voice', 'Bolein')}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="xp-btn xp-btn-start px-5 py-1.5 text-xs disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {loading
                    ? t('Examining Indian Laws...', 'Dhaarein check ho rahi hain...')
                    : t('Help me out', 'Meri madad karein')}
                </span>
              </button>
            </div>
          </div>
        </form>

        {needsKey && (
          <div className="rounded border-2 border-amber-500/60 bg-amber-500/10 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <KeyRound className="h-4 w-4" />
              <span>Gemini API Key Required for Live Computation</span>
            </div>
            <p className="font-medium text-[var(--text-primary)] leading-relaxed">
              Add your Gemini API key to <code className="font-mono font-bold">backend/.env</code> as{' '}
              <code className="font-mono font-bold">GEMINI_API_KEY=your_key_here</code> to activate live 4-pillar legal computation.
            </p>
          </div>
        )}

        {error && !needsKey && <p className="text-xs font-bold text-red-500">{error}</p>}

        {/* Theme-Aware Loader: Rotating Sun in Light Mode | Moon Phases in Dark Mode */}
        {loading && (
          <div className="xp-panel flex flex-col items-center justify-center gap-3 p-6 text-center">
            {theme === 'dark' ? (
              <MoonPhaseLoader />
            ) : (
              <svg
                viewBox="0 0 80 80"
                className="h-14 w-14 animate-spin"
                style={{ animationDuration: '4s' }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect
                    key={i}
                    x="38"
                    y="3"
                    width="4"
                    height="12"
                    rx="2"
                    fill="#FFB800"
                    transform={`rotate(${i * 30} 40 40)`}
                  />
                ))}
                <circle cx="40" cy="40" r="19" fill="#FFD54F" stroke="#FF9800" strokeWidth="2.5" />
              </svg>
            )}
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {t('Carefully examining your story across all 4 pillars...', 'Aapki baat ko 4 pillars par check kiya ja raha hai...')}
              </div>
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                {t(
                  'Checking Indian Dhaarein, statutory remedies, seriousness, and official digital portals.',
                  'Indian Dhaarein, saza, gambhirta aur sarkari portals taiyaar ho rahe hain.'
                )}
              </p>
            </div>
          </div>
        )}

        {/* 4-PILLAR COMPUTED RESULT (Arrows ONLY here, shifted to the sides with short punchy text) */}
        {result && (
          <div className="border-t border-[var(--border-subtle)] pt-3">
            <SolutionSideArrow label="what the laws say" side="left" />

            {/* PILLAR 1: VIOLATIONS & DHAAREIN COUNT */}
            <div className="xp-panel p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="xp-btn xp-btn-primary px-2.5 py-0.5 text-xs pointer-events-none">
                    Pillar 1
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {result.pillar1_violations.totalDharasViolated}{' '}
                    {t('Dhaarein / Legal Provisions Violated', 'Dhaarein / Kanoon Tode Gaye')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {result.fromCache && (
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                      Saved History • 0 tokens
                    </span>
                  )}
                  <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--text-accent)]">
                    {result.detectedCategory}
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold leading-relaxed text-[var(--text-primary)]">
                {result.pillar1_violations.compassionateValidation}
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {result.pillar1_violations.violations.map((v, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[var(--text-accent)]">
                      <Gavel className="h-3.5 w-3.5 shrink-0" />
                      <span>{v.code}</span>
                    </div>
                    <div className="mt-0.5 text-xs font-bold text-[var(--text-primary)]">{v.title}</div>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-[var(--text-secondary)]">
                      {v.whyItAppliesToYourStory}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <SolutionSideArrow label="what that a**hole deserves" side="right" />

            {/* PILLAR 2: ACCOUNTABILITY UNDER CONSTITUTION & LAW */}
            <div className="xp-panel p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="xp-btn xp-btn-gold px-2.5 py-0.5 text-xs pointer-events-none">
                  Pillar 2
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t('What Legal Action the Wrongdoer Faces Under Indian Law', 'Kanoon Ke Hisaab Se Saza Aur Remedies')}
                </h3>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Imprisonment / Jail Time
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    {result.pillar2_accountability.jailTime}
                  </p>
                </div>

                <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Fines & Compensation
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    {result.pillar2_accountability.finesAndCompensation}
                  </p>
                </div>

                <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Apology / Disciplinary / Other Remedies
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    {result.pillar2_accountability.otherRemedies}
                  </p>
                </div>
              </div>
            </div>

            <SolutionSideArrow label="what you can do now" side="left" />

            {/* PILLAR 3 + PILLAR 4 */}
            <div className="space-y-3">
              <div className={`rounded border-2 p-4 space-y-2.5 ${seriousnessColors[result.pillar3_seriousness.level]}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {result.pillar3_seriousness.beyondFirstAid ? (
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    )}
                    <h3 className="text-sm font-extrabold uppercase tracking-wide">
                      Pillar 3 • Seriousness: {result.pillar3_seriousness.level} ({result.pillar3_seriousness.scoreOutOf10}/10)
                    </h3>
                  </div>
                  {result.pillar3_seriousness.beyondFirstAid && (
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      Beyond First-Aid Alone
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold leading-relaxed">
                  {result.pillar3_seriousness.explanation}
                </p>
                <p className="text-xs font-bold leading-relaxed">
                  {result.pillar3_seriousness.lawyerRecommendation}
                </p>
              </div>

              <div className="xp-panel p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="xp-btn xp-btn-start px-2.5 py-0.5 text-xs pointer-events-none">
                    Pillar 4
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {t('Digital First-Aid: Immediate Steps, Portals & Knowledge Guides', 'Digital First-Aid: Steps, Sarkari Portals & YouTube Guides')}
                  </h3>
                </div>

                <ol className="space-y-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 text-xs font-medium leading-relaxed text-[var(--text-primary)]">
                  {result.pillar4_digitalFirstAid.immediateSteps.map((step, i) => (
                    <li key={i}>
                      <strong className="font-mono text-[var(--text-accent)]">{i + 1}. </strong>
                      {step}
                    </li>
                  ))}
                </ol>

                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t('Official Portals (Hover on "i" for step-by-step guide)', 'Sarkari Portals ("i" par hover karein)')}
                  </h4>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {result.pillar4_digitalFirstAid.govPortals.map((portal, idx) => (
                      <div
                        key={idx}
                        className="relative flex flex-col justify-between rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-[var(--text-accent)] hover:underline"
                          >
                            {portal.name}
                          </a>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div
                              className="relative"
                              onMouseEnter={() => setHoveredPortal(idx)}
                              onMouseLeave={() => setHoveredPortal(null)}
                            >
                              <button
                                type="button"
                                onClick={() => setHoveredPortal(hoveredPortal === idx ? null : idx)}
                                className="xp-btn h-5 w-5 p-0 text-[var(--text-accent)]"
                                aria-label="Website steps"
                              >
                                <Info className="h-3 w-3" />
                              </button>

                              {hoveredPortal === idx && (
                                <div className="xp-window absolute bottom-7 right-0 z-30 w-64 text-left shadow-2xl">
                                  <div className="xp-titlebar py-1 px-2 text-[10px] font-bold">
                                    Steps on this Portal
                                  </div>
                                  <ol className="space-y-1 p-2.5 text-[11px] font-medium leading-snug text-[var(--text-primary)]">
                                    {portal.hoverSteps.map((s, si) => (
                                      <li key={si}>
                                        <span className="font-mono font-bold text-[var(--text-accent)]">
                                          {si + 1}.{' '}
                                        </span>
                                        {s}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>

                            <a
                              href={portal.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[var(--text-secondary)] hover:text-[var(--text-accent)]"
                              title="Open in new tab"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>

                        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{portal.purpose}</p>
                        {portal.helpline && (
                          <span className="mt-2 inline-block font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Helpline: {portal.helpline}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t('YouTube Knowledge Guides (What You Will Learn)', 'YouTube Knowledge Videos (Isme Kya Seekhenge)')}
                  </h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {result.youtubeGuidesWithUrls.map((vid, idx) => (
                      <a
                        key={idx}
                        href={vid.searchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col justify-between rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5 transition hover:border-red-500/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4 shrink-0 text-red-600" />
                            <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-red-600">
                              {vid.title}
                            </span>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]" />
                        </div>
                        <p className="mt-2 text-[11px] font-medium leading-relaxed text-[var(--text-secondary)]">
                          <strong className="text-[var(--text-primary)]">Trailer: </strong>
                          {vid.trailerText}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SolutionSideArrow label="lodge this complaint in the court of people" side="right" />

            <div className="rounded-md border-2 border-[#2b6be0] bg-[var(--bg-elevated)] p-5 text-center shadow-md space-y-3">
              <h4 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] sm:text-xl">
                LODGE THIS COMPLAINT IN THE COURT OF PEOPLE
              </h4>
              <p className="mx-auto max-w-xl text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Create your quick anonymous account (Name, Alias, Phone OTP & Gmail) in 30 seconds. Your real identity stays hidden while verified advocates comment on how they can help.',
                  'Sirf 30 second mein apna anonymous account banayein (Name, Alias, Phone OTP aur Gmail) aur apni complaint Court of People mein lodge karein.'
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleLodgeInCourt}
                  disabled={draftingPost}
                  className="xp-btn xp-btn-start px-6 py-2.5 text-xs uppercase tracking-wider disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {draftingPost
                      ? t('Drafting Your Complaint Post with AI...', 'AI Aapki Post Likh Raha Hai...')
                      : t('Lodge This Complaint in the Court of People', 'Court of People Mein Lodge Karein')}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/leaderboard" className="xp-btn xp-btn-gold px-4 py-2.5 text-xs">
                  <Scale className="h-3.5 w-3.5" />
                  <span>{t('Find Lawyers Near You', 'Apne Paas Wakeel Khojein')}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI-DRAFTED COMPLAINT PREVIEW & INSTANT PUBLISH MODAL */}
      {draftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="xp-window w-full max-w-2xl shadow-2xl">
            <div className="xp-titlebar">
              <div className="flex items-center gap-2">
                <XpNotepadIcon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold">
                  AI_Drafted_Complaint.doc — Preview & Publish to Court of People
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDraftModalOpen(false)}
                className="xp-win-ctrl xp-win-ctrl-close"
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded bg-[#2b6be0]/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[var(--text-accent)]">
                    {draftCategory} • Anonymous Post
                  </span>
                  <h3 className="mt-1 text-base font-bold text-[var(--text-primary)]">
                    {t('Your AI-Drafted Court of People Post', 'Aapki AI-Drafted Court of People Post')}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setDraftEditing((v) => !v)}
                  className={`xp-btn px-3 py-1.5 text-xs ${draftEditing ? 'xp-btn-gold' : ''}`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{draftEditing ? 'Done Editing' : 'Edit Before Posting'}</span>
                </button>
              </div>

              {draftEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                      Post Headline
                    </label>
                    <input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="xp-input w-full px-3 py-2 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                      Post Body (Your Sentiments & Facts)
                    </label>
                    <textarea
                      rows={6}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      className="xp-input w-full p-3 text-sm font-medium leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                <div className="xp-panel p-4 space-y-2.5">
                  <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                    Posting anonymously as:{' '}
                    <span className="text-blue-700 dark:text-blue-300">
                      {user?.stageName || 'Your New Anonymous Alias'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">{draftTitle}</h4>
                  <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-[var(--text-primary)]">
                    {draftBody}
                  </p>
                </div>
              )}

              {draftError && <p className="text-xs font-bold text-red-500">{draftError}</p>}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => setDraftModalOpen(false)}
                  className="xp-btn px-4 py-2 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePublishDraftLive}
                  disabled={publishingPost}
                  className="xp-btn xp-btn-start px-5 py-2 text-xs disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {publishingPost
                      ? 'Publishing Live...'
                      : user
                      ? draftEditing
                        ? 'Publish Edited Post Live'
                        : 'Post Without Editing — Make Live!'
                      : 'Create Account & Post Live!'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="xp-statusbar">
        <span>
          {geminiReady === true
            ? 'Engine: Connected to Gemini (Live 4-Pillar Computation)'
            : geminiReady === false
            ? 'Engine: Awaiting GEMINI_API_KEY in backend/.env'
            : 'Engine: Checking status...'}
        </span>
        <span className="font-mono">Self-Learning Experience Store Active</span>
      </div>
    </XpWindow>
  );
};

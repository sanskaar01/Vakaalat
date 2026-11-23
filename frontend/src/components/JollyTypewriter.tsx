import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Gavel,
  History,
  Info,
  KeyRound,
  Mic,
  MicOff,
  PlayCircle,
  RefreshCw,
  Scale,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { LangMode, translateCategory } from '../lib/i18n';
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
  const [translatingResult, setTranslatingResult] = useState(false);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<ComputedLegalAnalysis | null>(null);
  const [resultLang, setResultLang] = useState<LangMode>('en');
  const resultsByLangRef = useRef<Partial<Record<LangMode, ComputedLegalAnalysis>>>({});

  const [history, setHistory] = useState<SavedHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredPortal, setHoveredPortal] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [needsKey, setNeedsKey] = useState(false);

  // Instant Post Editor Modal + Background AI Pre-Draft
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftCategory, setDraftCategory] = useState('Criminal');
  const [writingWithAi, setWritingWithAi] = useState(false);
  const [publishingPost, setPublishingPost] = useState(false);
  const [draftError, setDraftError] = useState('');

  // Background pre-generated AI drafts keyed by language
  const bgDraftCacheRef = useRef<Partial<Record<LangMode, { title: string; body: string; category: string }>>>({});
  const bgDraftPromiseRef = useRef<Promise<{ title: string; body: string; category: string } | null> | null>(null);

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
    loadHistory();
  }, [token]);

  // Background AI post pre-generator (runs silently right after 4-pillar analysis completes!)
  const startBackgroundDraftGeneration = (analysis: ComputedLegalAnalysis, targetLang: LangMode) => {
    if (bgDraftCacheRef.current[targetLang]) return;

    const promise = apiFetch<{ title: string; body: string; category: string }>(
      '/jolly/draft-post',
      {
        method: 'POST',
        body: JSON.stringify({
          userStory: analysis.draftPostRaw,
          category: analysis.detectedCategory,
          dharas: analysis.pillar1_violations.violations.map((v) => v.code),
          language: targetLang,
        }),
      },
      token
    )
      .then((drafted) => {
        bgDraftCacheRef.current[targetLang] = drafted;
        return drafted;
      })
      .catch(() => null);

    bgDraftPromiseRef.current = promise;
  };

  // Live language switcher for already-computed 4-pillar response!
  useEffect(() => {
    if (!result || resultLang === lang) return;

    // 1. Check in-memory language cache first (instant 0ms switch!)
    const cachedForLang = resultsByLangRef.current[lang];
    if (cachedForLang) {
      setResult(cachedForLang);
      setResultLang(lang);
      startBackgroundDraftGeneration(cachedForLang, lang);
      return;
    }

    // 2. Otherwise translate the active 4-pillar result live into the clicked language
    let cancelled = false;
    setTranslatingResult(true);
    apiFetch<ComputedLegalAnalysis>(
      '/jolly/translate-result',
      {
        method: 'POST',
        body: JSON.stringify({ analysis: result, language: lang }),
      },
      token
    )
      .then((translated) => {
        if (cancelled) return;
        resultsByLangRef.current[lang] = translated;
        setResult(translated);
        setResultLang(lang);
        startBackgroundDraftGeneration(translated, lang);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTranslatingResult(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, result, resultLang]);

  const handleVoiceToggle = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(
        t(
          'Voice input works in Chrome/Edge. Please type your story.',
          'Voice input Chrome/Edge mein chalta hai. Kripya type karein.',
          'वॉइस इनपुट Chrome/Edge में काम करता है। कृपया अपनी कहानी टाइप करें।'
        )
      );
      return;
    }

    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
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
      setError(
        t(
          'Please share a few words about what happened so we can examine it with care.',
          'Kripya thoda vistaar se batayein kya hua.',
          'कृपया थोड़ा विस्तार से बताएं कि क्या हुआ ताकि हम सही जांच कर सकें।'
        )
      );
      return;
    }

    setError('');
    setNeedsKey(false);
    setLoading(true);
    setIsComputing(true);
    triggerScenicBurst(10_000);
    setResult(null);
    resultsByLangRef.current = {};
    bgDraftCacheRef.current = {};
    bgDraftPromiseRef.current = null;

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
        }
        throw new Error(data.error || 'Legal analysis failed');
      }

      const analysis = data as ComputedLegalAnalysis;
      resultsByLangRef.current[lang] = analysis;
      setResultLang(lang);
      setResult(analysis);
      loadHistory();

      // Immediately start pre-generating the AI Court of People draft in the background!
      startBackgroundDraftGeneration(analysis, lang);
    } catch (err: any) {
      setError(err.message || 'Could not compute legal analysis.');
    } finally {
      setLoading(false);
      setIsComputing(false);
    }
  };

  // Opens the editor modal in 0ms (empty fields first so user can write themselves or click "Write with AI")
  const handleOpenLodgeEditor = () => {
    if (!result) return;
    setDraftError('');
    setDraftCategory(result.detectedCategory || 'Criminal');
    setDraftTitle('');
    setDraftBody('');
    setDraftModalOpen(true);

    // Ensure background AI draft is running if not already cached
    startBackgroundDraftGeneration(result, lang);
  };

  // Fills the editor when user clicks "Write with AI" (uses pre-generated background draft!)
  const handleFillWithAi = async () => {
    if (!result) return;
    setDraftError('');

    const cached = bgDraftCacheRef.current[lang];
    if (cached) {
      setDraftTitle(cached.title);
      setDraftBody(cached.body);
      setDraftCategory(cached.category || result.detectedCategory);
      return;
    }

    setWritingWithAi(true);
    try {
      if (bgDraftPromiseRef.current) {
        const awaited = await bgDraftPromiseRef.current;
        if (awaited) {
          setDraftTitle(awaited.title);
          setDraftBody(awaited.body);
          setDraftCategory(awaited.category || result.detectedCategory);
          return;
        }
      }

      const fresh = await apiFetch<{ title: string; body: string; category: string }>(
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
      bgDraftCacheRef.current[lang] = fresh;
      setDraftTitle(fresh.title);
      setDraftBody(fresh.body);
      setDraftCategory(fresh.category || result.detectedCategory);
    } catch (err: any) {
      setDraftTitle(result.suggestedPostTitle);
      setDraftBody(result.draftPostRaw);
      setDraftError(err.message || 'Filled with your story summary.');
    } finally {
      setWritingWithAi(false);
    }
  };

  const handlePublishDraftLive = async () => {
    if (!draftTitle.trim() || draftBody.trim().length < 15) {
      setDraftError(
        t(
          'Please write a headline and description (or click "Write with AI" above).',
          'Kripya headline aur vivaran likhein (ya upar "Write with AI" dabayein).',
          'कृपया शीर्षक और विवरण लिखें (या ऊपर "AI से लिखवाएं" बटन दबाएं)।'
        )
      );
      return;
    }

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
      title={t(
        'Vakaalat_Legal_Engine.exe — Live Constitutional & First-Aid Analysis',
        'Vakaalat_Legal_Engine.exe — Live Kanooni & First-Aid Analysis',
        'वकालत_लीगल_इंजन.exe — लाइव संवैधानिक एवं फर्स्ट-एड विश्लेषण'
      )}
      icon={<XpNotepadIcon className="h-4 w-4 shrink-0" />}
      className="mx-auto w-full max-w-4xl"
    >
      <div className="p-3.5 sm:p-6 space-y-4">
        <div className="xp-panel flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <XpShieldIcon className="h-4 w-4 shrink-0" />
            <span>
              {t(
                'Private First-Aid Legal Engine — Every story is examined live with care & respect.',
                'Private Legal Engine — Har kahani ko live aur poori izzat ke saath samjha jaata hai.',
                'प्राइवेट फर्स्ट-एड लीगल इंजन — हर घटना की लाइव, सम्मान और संवेदनशीलता के साथ जांच की जाती है।'
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
              <span>
                {t('Saved History', 'Saved History', 'पुराना इतिहास')} ({history.length})
              </span>
            </button>
          )}
        </div>

        {user && showHistory && (
          <div className="xp-panel p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {t(
                'Click any past prompt to reopen its saved 4-pillar response instantly:',
                'Kisi bhi purani prompt par click karke uska 4-pillar jawab turant kholein:',
                'किसी भी पुराने मामले पर क्लिक करके उसका 4-स्तंभ विश्लेषण तुरंत खोलें:'
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">
                {t(
                  'No saved history yet. Submit a story below and it will be saved safely to your account.',
                  'Abhi koi history nahi hai. Neeche apni baat likhein, woh safe rahegi.',
                  'अभी कोई इतिहास नहीं है। नीचे अपनी कहानी लिखें, वह आपके अकाउंट में सुरक्षित रहेगी।'
                )}
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setQuery(item.query);
                      resultsByLangRef.current = { [lang]: { ...item.analysis, fromCache: true } };
                      setResultLang(lang);
                      setResult({ ...item.analysis, fromCache: true });
                      setShowHistory(false);
                      startBackgroundDraftGeneration(item.analysis, lang);
                    }}
                    className="xp-btn flex-col items-start p-2.5 text-left"
                  >
                    <span className="line-clamp-1 text-xs font-bold">
                      {item.analysis.suggestedPostTitle || item.query}
                    </span>
                    <span className="font-mono text-[10px] opacity-75">
                      {translateCategory(item.category, lang)} • {new Date(item.createdAt).toLocaleDateString()}
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
              'Apni poori kahani apne andaaz mein likhein. Bilkul raw aur real.',
              'अपनी पूरी कहानी अपने शब्दों में लिखें। बिल्कुल सच्ची और बिना किसी झिझक के।'
            )}
            className="xp-input w-full resize-none p-3.5 text-sm font-medium leading-relaxed placeholder:font-bold placeholder:text-[var(--text-secondary)]/70"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              {t(
                'Analyzed live against Indian Law & Constitution.',
                'Seedha Indian Law aur Constitution ke hisaab se live analysis.',
                'भारतीय कानून और संविधान के अनुसार सीधा (Live) विश्लेषण।'
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
                <span>
                  {recording
                    ? t('Stop Mic', 'Rokein', 'माइक रोकें')
                    : t('Record Voice', 'Bolein', 'आवाज़ रिकॉर्ड करें')}
                </span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="xp-btn xp-btn-start px-5 py-1.5 text-xs disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {loading
                    ? t('Examining Indian Laws...', 'Dhaarein check ho rahi hain...', 'कानूनी धाराओं की जांच हो रही है...')
                    : t('Help me out', 'Meri madad karein', 'मेरी मदद करें')}
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
              <code className="font-mono font-bold">GEMINI_API_KEY=your_key_here</code>.
            </p>
          </div>
        )}

        {error && !needsKey && <p className="text-xs font-bold text-red-500">{error}</p>}

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
                {t(
                  'Carefully examining your story across all 4 pillars...',
                  'Aapki baat ko 4 pillars par check kiya ja raha hai...',
                  'आपकी कहानी का चारों कानूनी स्तंभों (4 Pillars) पर विश्लेषण किया जा रहा है...'
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                {t(
                  'Checking Indian Dhaarein, statutory remedies, seriousness, and official digital portals.',
                  'Indian Dhaarein, saza, gambhirta aur sarkari portals taiyaar ho rahe hain.',
                  'भारतीय धाराएं, कानूनी सज़ा, मामले की गंभीरता और सरकारी पोर्टल तैयार किए जा रहे हैं।'
                )}
              </p>
            </div>
          </div>
        )}

        {translatingResult && (
          <div className="xp-panel flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-[var(--text-accent)]">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>
              {t(
                'Converting analysis to English...',
                'Analysis ko Hinglish mein badla ja raha hai...',
                'विश्लेषण को हिंदी में बदला जा रहा है...'
              )}
            </span>
          </div>
        )}

        {result && (
          <div className="border-t border-[var(--border-subtle)] pt-3">
            <SolutionSideArrow
              label={t('what the laws say', 'kanoon kya kehta hai', 'कानून क्या कहता है')}
              side="left"
            />

            {/* PILLAR 1 */}
            <div className="xp-panel p-3.5 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="xp-btn xp-btn-primary px-2.5 py-0.5 text-xs pointer-events-none">
                    {t('Pillar 1', 'Pillar 1', 'स्तंभ 1')}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {result.pillar1_violations.totalDharasViolated}{' '}
                    {t('Dhaarein / Legal Provisions Violated', 'Dhaarein / Kanoon Tode Gaye', 'उल्लंघन की गई कानूनी धाराएं')}
                  </h3>
                </div>
                <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--text-accent)]">
                  {translateCategory(result.detectedCategory, lang)}
                </span>
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

            <SolutionSideArrow
              label={t('what that a**hole deserves', 'doshee ko kya saza milegi', 'दोषी को क्या सज़ा मिलनी चाहिए')}
              side="right"
            />

            {/* PILLAR 2 */}
            <div className="xp-panel p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="xp-btn xp-btn-gold px-2.5 py-0.5 text-xs pointer-events-none">
                  {t('Pillar 2', 'Pillar 2', 'स्तंभ 2')}
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t(
                    'What Legal Action the Wrongdoer Faces Under Indian Law',
                    'Kanoon Ke Hisaab Se Saza Aur Remedies',
                    'भारतीय कानून के तहत दोषी को क्या सज़ा मिल सकती है'
                  )}
                </h3>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t('Imprisonment / Jail Time', 'Jail Ki Saza', 'कारावास / जेल की सज़ा')}
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    {result.pillar2_accountability.jailTime}
                  </p>
                </div>

                <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t('Fines & Compensation', 'Jurmana Aur Muavza', 'जुर्माना एवं मुआवज़ा')}
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    {result.pillar2_accountability.finesAndCompensation}
                  </p>
                </div>

                <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t('Apology / Disciplinary / Other Remedies', 'Maafi / Suspension / Anya Kadam', 'माफी / निलंबन / अन्य कानूनी उपाय')}
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--text-primary)]">
                    {result.pillar2_accountability.otherRemedies}
                  </p>
                </div>
              </div>
            </div>

            <SolutionSideArrow
              label={t('what you can do now', 'ab aap kya kar sakte hain', 'अब आप तुरंत क्या कर सकते हैं')}
              side="left"
            />

            {/* PILLAR 3 + PILLAR 4 */}
            <div className="space-y-3">
              <div className={`rounded border-2 p-3.5 sm:p-4 space-y-2.5 ${seriousnessColors[result.pillar3_seriousness.level]}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {result.pillar3_seriousness.beyondFirstAid ? (
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                    )}
                    <h3 className="text-sm font-extrabold uppercase tracking-wide">
                      {t('Pillar 3 • Seriousness:', 'Pillar 3 • Gambhirta:', 'स्तंभ 3 • मामले की गंभीरता:')}{' '}
                      {result.pillar3_seriousness.level} ({result.pillar3_seriousness.scoreOutOf10}/10)
                    </h3>
                  </div>
                  {result.pillar3_seriousness.beyondFirstAid && (
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {t('Beyond First-Aid Alone', 'Wakeel Ki Zaroorat', 'वकील की सलाह आवश्यक')}
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

              <div className="xp-panel p-3.5 sm:p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="xp-btn xp-btn-start px-2.5 py-0.5 text-xs pointer-events-none">
                    {t('Pillar 4', 'Pillar 4', 'स्तंभ 4')}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {t(
                      'Digital First-Aid: Immediate Steps, Portals & Knowledge Guides',
                      'Digital First-Aid: Steps, Sarkari Portals & YouTube Guides',
                      'डिजिटल फर्स्ट-एड: तत्काल कदम, सरकारी पोर्टल और यूट्यूब गाइड्स'
                    )}
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
                    {t(
                      'Official Portals (Hover or tap "i" for step-by-step guide)',
                      'Sarkari Portals ("i" par click ya hover karein)',
                      'आधिकारिक सरकारी पोर्टल (स्टेप्स देखने के लिए "i" पर टैप या माउस ले जाएं)'
                    )}
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
                                    {t('Steps on this Portal', 'Is Portal Ke Steps', 'इस पोर्टल पर क्या करें')}
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
                    {t(
                      'YouTube Knowledge Guides (What You Will Learn)',
                      'YouTube Knowledge Videos (Isme Kya Seekhenge)',
                      'यूट्यूब नॉलेज गाइड्स (आप इस वीडियो में क्या सीखेंगे)'
                    )}
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
                          <strong className="text-[var(--text-primary)]">
                            {t('Trailer:', 'Trailer:', 'झलक:')}{' '}
                          </strong>
                          {vid.trailerText}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SolutionSideArrow
              label={t(
                'lodge this complaint in the court of people',
                'janta ki adalat mein lodge karein',
                'जनता की अदालत में यह शिकायत दर्ज करें'
              )}
              side="right"
            />

            <div className="rounded-md border-2 border-[#2b6be0] bg-[var(--bg-elevated)] p-4 sm:p-5 text-center shadow-md space-y-3">
              <h4 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] sm:text-xl">
                {t(
                  'LODGE THIS COMPLAINT IN THE COURT OF PEOPLE',
                  'COURT OF PEOPLE MEIN YEH COMPLAINT LODGE KAREIN',
                  'इस शिकायत को जनता की अदालत में दर्ज करें'
                )}
              </h4>
              <p className="mx-auto max-w-xl text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Write your post yourself or click "Write with AI" inside the editor. Your real identity stays hidden while verified advocates comment on how they can help.',
                  'Editor mein apni post khud likhein ya "Write with AI" dabayein. Aapki asli pehchan gupt rahegi.',
                  'एडिटर में अपनी पोस्ट स्वयं लिखें या "AI से लिखवाएं" दबाएं। आपकी असली पहचान पूरी तरह गुप्त रहेगी।'
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenLodgeEditor}
                  className="xp-btn xp-btn-start px-6 py-2.5 text-xs uppercase tracking-wider"
                >
                  <span>
                    {t(
                      'Lodge This Complaint in the Court of People',
                      'Court of People Mein Lodge Karein',
                      'इस शिकायत को जनता की अदालत में दर्ज करें'
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/leaderboard" className="xp-btn xp-btn-gold px-4 py-2.5 text-xs">
                  <Scale className="h-3.5 w-3.5" />
                  <span>{t('Find Lawyers Near You', 'Apne Paas Wakeel Khojein', 'अपने पास के वकील खोजें')}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INSTANT POST WRITING EDITOR MODAL + "WRITE WITH AI" BUTTON */}
      {draftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm">
          <div className="xp-window w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">
            <div className="xp-titlebar shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <XpNotepadIcon className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs font-bold">
                  {t(
                    'Lodge_Complaint.doc — Write Your Post or Use AI',
                    'Lodge_Complaint.doc — Khud Likhein Ya AI Se Likhwayein',
                    'शिकायत_पोस्ट.doc — स्वयं लिखें या AI की मदद लें'
                  )}
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

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded bg-[#2b6be0]/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[var(--text-accent)]">
                    {translateCategory(draftCategory, lang)} •{' '}
                    {t('Anonymous Post', 'Anonymous Post', 'गुप्त पोस्ट')}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-[var(--text-primary)]">
                    {t(
                      'Write Your Court of People Post',
                      'Apni Court of People Post Likhein',
                      'जनता की अदालत के लिए अपनी पोस्ट लिखें'
                    )}
                  </h3>
                </div>

                {/* "Write with AI" Button (fills from pre-generated background AI draft!) */}
                <button
                  type="button"
                  onClick={handleFillWithAi}
                  disabled={writingWithAi}
                  className="xp-btn xp-btn-gold px-3.5 py-1.5 text-xs disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {writingWithAi
                      ? t('Writing with AI...', 'AI Likh Raha Hai...', 'AI लिख रहा है...')
                      : t('Write with AI', 'AI Se Likhein', 'AI से लिखवाएं')}
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                    {t('Post Headline', 'Post Headline', 'पोस्ट का शीर्षक')}
                  </label>
                  <input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder={t(
                      'Write a short headline in your own words (or click "Write with AI" above)...',
                      'Apne shabdon mein headline likhein (ya upar "AI Se Likhein" dabayein)...',
                      'अपने शब्दों में शीर्षक लिखें (या ऊपर "AI से लिखवाएं" बटन दबाएं)...'
                    )}
                    className="xp-input w-full px-3 py-2 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                    {t(
                      'Your Complaint / Story (Real names & amounts are masked automatically)',
                      'Aapki Complaint (Asli naam aur paise apne aap blur ho jayenge)',
                      'आपकी शिकायत का विवरण (असली नाम और पैसे अपने आप छुपा दिए जाएंगे)'
                    )}
                  </label>
                  <textarea
                    rows={6}
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    placeholder={t(
                      'Write your complaint yourself here, or tap "Write with AI" to auto-fill it with your sentiments and violated Dhaarein...',
                      'Yahan khud likhein, ya "AI Se Likhein" dabakar AI se taiyaar karwayein...',
                      'यहाँ अपनी शिकायत स्वयं लिखें, या "AI से लिखवाएं" पर क्लिक करके अपनी भावनाओं और कानूनी धाराओं के साथ ऑटो-फ़िल करें...'
                    )}
                    className="xp-input w-full p-3 text-sm font-medium leading-relaxed"
                  />
                </div>
              </div>

              {draftError && <p className="text-xs font-bold text-red-500">{draftError}</p>}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => setDraftModalOpen(false)}
                  className="xp-btn px-4 py-2 text-xs"
                >
                  {t('Cancel', 'Radd Karein', 'रद्द करें')}
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
                      ? t('Publishing Live...', 'Post Ho Raha Hai...', 'लाइव पोस्ट हो रहा है...')
                      : user
                      ? t('Publish Post Live!', 'Live Post Karein!', 'अभी लाइव पोस्ट करें!')
                      : t('Create Account & Post Live!', 'Account Banayein & Live Post Karein!', 'अकाउंट बनाएं और लाइव पोस्ट करें!')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </XpWindow>
  );
};

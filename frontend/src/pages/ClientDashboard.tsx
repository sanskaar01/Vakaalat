import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  MessageSquare,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Terminal,
  ThumbsUp,
  X,
} from 'lucide-react';
import { JollyTypewriter } from '../components/JollyTypewriter';
import { XpFolderIcon, XpNotepadIcon, XpScalesIcon, XpWindow } from '../components/XpIcons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { ClickableBlurredText, translateCategory } from '../lib/i18n';

interface DiaryComment {
  id: string;
  content: string;
  likesCount: number;
  createdAt: string;
  authorStageName: string;
  authorRole: 'client' | 'lawyer' | 'admin';
}

interface ClientThread {
  id: string;
  category: string;
  title: string;
  rawContent: string;
  maskedContent: string;
  upvotes: number;
  createdAt: string;
  comments: DiaryComment[];
}

const CATEGORIES = ['Theft & Cyber', 'Marital', 'Criminal', 'Property', 'Consumer', 'Labour', 'Financial'];

export const ClientDashboard: React.FC = () => {
  const { user, token, lang, t } = useApp();
  const [myThreads, setMyThreads] = useState<ClientThread[]>([]);
  const [selectedFile, setSelectedFile] = useState<ClientThread | null>(null);
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [showJolly, setShowJolly] = useState(false);

  const [composerOpen, setComposerOpen] = useState(false);
  const [category, setCategory] = useState('Theft & Cyber');
  const [title, setTitle] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [previewDraftMasked, setPreviewDraftMasked] = useState(false);
  const [posting, setPosting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadMine = async () => {
    if (!token) return;
    const res = await apiFetch<{ threads: ClientThread[] }>('/threads/mine', {}, token);
    setMyThreads(res.threads);
  };

  useEffect(() => {
    loadMine();
    const pending = sessionStorage.getItem('vakaalat_pending_draft');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        setCategory(parsed.category || 'Theft & Cyber');
        setTitle(parsed.title || '');
        setRawContent(parsed.rawContent || '');
        setComposerOpen(true);
        sessionStorage.removeItem('vakaalat_pending_draft');
      } catch {
        // ignore
      }
    }
  }, [token]);

  const computeClientMaskPreview = (txt: string) => {
    return txt
      .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g, '[MASKED-ID]')
      .replace(/(?:₹|Rs\.?\s?)\d[\d,]*(?:\.\d+)?/gi, (m) => `[BLURRED: ${m.replace(/\d/g, 'X')}]`);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setStatusMsg('');
    try {
      await apiFetch(
        '/threads',
        { method: 'POST', body: JSON.stringify({ category, title, rawContent }) },
        token
      );
      setTitle('');
      setRawContent('');
      setComposerOpen(false);
      setStatusMsg(
        t(
          'File saved to your Personal Diary Desktop & lodged anonymously in the Court of People!',
          'File aapke Personal Diary Desktop par save ho gayi aur Court of People mein post ho gayi!',
          'फ़ाइल आपकी गुप्त डायरी में सेव हो गई है और जनता की अदालत में दर्ज कर दी गई है!'
        )
      );
      loadMine();
    } catch (err: any) {
      setStatusMsg(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <XpWindow
        title={t(
          `Personal_Diary_Desktop — ${user?.stageName || 'Citizen'} (My Legal Files)`,
          `Personal_Diary_Desktop — ${user?.stageName || 'Nagrik'} (Meri Kanooni Files)`,
          `मेरी_गुप्त_डायरी — ${user?.stageName || 'नागरिक'} (मेरी कानूनी फ़ाइलें)`
        )}
        icon={<XpFolderIcon className="h-4 w-4 shrink-0" />}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--xp-panel-bg)] px-4 py-2.5">
          <div className="text-xs font-bold text-[var(--text-primary)]">
            C:\Users\{user?.stageName?.replace(/\s+/g, '_') || 'Citizen'}\Personal_Diary\
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowJolly((v) => !v)} className="xp-btn px-3 py-1.5 text-xs">
              <Terminal className="h-3.5 w-3.5" />
              <span>
                {showJolly
                  ? t('Close Legal Engine', 'Engine Band Karein', 'लीगल इंजन बंद करें')
                  : t('Open Legal Engine', 'Legal Engine Kholein', 'लीगल इंजन खोलें')}
              </span>
            </button>
            <button
              onClick={() => setComposerOpen((v) => !v)}
              className="xp-btn xp-btn-start px-3 py-1.5 text-xs"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>{t('New Complaint File', 'Nayi Complaint File', 'नई शिकायत फ़ाइल')}</span>
            </button>
            <Link to="/court" className="xp-btn xp-btn-primary px-3 py-1.5 text-xs">
              <XpScalesIcon className="h-3.5 w-3.5" />
              <span>{t('Court of People', 'Janta Ki Adalat', 'जनता की अदालत')}</span>
            </Link>
          </div>
        </div>

        <div className="min-h-[260px] p-6">
          {statusMsg && (
            <div className="mb-4 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {statusMsg}
            </div>
          )}

          {myThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
              <XpFolderIcon className="h-14 w-14 opacity-60" />
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {t(
                  'Your Personal Diary Desktop is empty.',
                  'Aapka Personal Diary Desktop abhi khaali hai.',
                  'आपकी गुप्त डायरी का डेस्कटॉप अभी खाली है।'
                )}
              </p>
              <p className="max-w-md text-xs font-medium text-[var(--text-secondary)]">
                {t(
                  'Click "New Complaint File" above or analyze an incident in the Legal Engine to create your first anonymous file.',
                  'Upar "Nayi Complaint File" par click karein ya Legal Engine mein apni baat likhein.',
                  'ऊपर "नई शिकायत फ़ाइल" पर क्लिक करें या लीगल इंजन में अपनी घटना का विश्लेषण करें।'
                )}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t(
                  'Click any file icon to open your lodged complaint, likes & advocate comments:',
                  'Kisi bhi file icon par click karke apni complaint, likes aur wakeelon ke comments dekhein:',
                  'अपनी शिकायत, लाइक्स और वकीलों की टिप्पणियां देखने के लिए किसी भी फ़ाइल आइकन पर क्लिक करें:'
                )}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {myThreads.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowPublicPreview(false);
                      }}
                      className={`group flex flex-col items-center rounded-md border p-3 text-center transition ${
                        isSelected
                          ? 'border-[#2b6be0] bg-[#2b6be0]/15 shadow-inner'
                          : 'border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--xp-panel-bg)]'
                      }`}
                    >
                      <div className="relative">
                        <XpNotepadIcon className="h-14 w-14 drop-shadow-sm transition-transform group-hover:scale-105" />
                        <span className="absolute -bottom-1 -right-2 rounded bg-[#2b6be0] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow">
                          {file.comments.length} 💬
                        </span>
                      </div>
                      <span className="mt-2.5 line-clamp-2 text-xs font-bold leading-snug text-[var(--text-primary)]">
                        {file.title}
                      </span>
                      <span className="mt-1 font-mono text-[10px] font-semibold text-[var(--text-secondary)]">
                        {translateCategory(file.category, lang)} • {file.upvotes} {t('likes', 'likes', 'लाइक्स')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="xp-statusbar">
          <span>
            {myThreads.length} {t('file(s) in Personal Diary', 'files Personal Diary mein', 'फ़ाइलें गुप्त डायरी में')}
          </span>
          <span>
            {t(
              'Click any file to inspect comments & likes',
              'Comments aur likes dekhne ke liye file par click karein',
              'टिप्पणियां और लाइक्स देखने के लिए किसी भी फ़ाइल पर क्लिक करें'
            )}
          </span>
        </div>
      </XpWindow>

      {selectedFile && (
        <div className="xp-window shadow-2xl">
          <div className="xp-titlebar">
            <div className="flex items-center gap-2 min-w-0">
              <XpNotepadIcon className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs font-bold">
                {selectedFile.title} — {t('Notebook Case File', 'Notebook Case File', 'नोटबुक केस फ़ाइल')}
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="xp-win-ctrl xp-win-ctrl-close"
              aria-label="Close file"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="xp-panel px-2.5 py-0.5 text-xs font-bold text-[var(--text-accent)]">
                  {translateCategory(selectedFile.category, lang)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-primary)]">
                  <ThumbsUp className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                  {selectedFile.upvotes} {t('Likes', 'Likes', 'लाइक्स')}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-primary)]">
                  <MessageSquare className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                  {selectedFile.comments.length} {t('Comments', 'Comments', 'टिप्पणियां')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowPublicPreview((v) => !v)}
                className={`xp-btn px-3 py-1 text-xs ${showPublicPreview ? 'xp-btn-gold' : ''}`}
              >
                {showPublicPreview ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>
                  {showPublicPreview
                    ? t('Showing Public Blurred View', 'Public Blurred View', 'सार्वजनिक धुंधला (Blur) रूप')
                    : t('Showing Your Private Diary', 'Private Diary View', 'आपकी निजी डायरी का रूप')}
                </span>
              </button>
            </div>

            <div
              className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 shadow-inner"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 27px, rgba(127,157,185,0.16) 28px)',
                lineHeight: '28px',
              }}
            >
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedFile.title}</h2>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                {showPublicPreview ? (
                  <ClickableBlurredText text={selectedFile.maskedContent} />
                ) : (
                  selectedFile.rawContent
                )}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t(
                  `Advocate & Community Comments (${selectedFile.comments.length})`,
                  `Wakeelon Aur Logon Ke Comments (${selectedFile.comments.length})`,
                  `वकीलों एवं नागरिकों की टिप्पणियां (${selectedFile.comments.length})`
                )}
              </h3>
              {selectedFile.comments.length === 0 ? (
                <div className="xp-panel p-4 text-xs font-medium text-[var(--text-secondary)]">
                  {t(
                    'No comments yet. Verified Kanpur advocates and citizens in the Court of People can reply here soon.',
                    'Abhi koi comment nahi hai. Jald hi verified wakeel yahan jawab denge.',
                    'अभी कोई टिप्पणी नहीं है। जनता की अदालत में सत्यापित वकील जल्द ही यहाँ मार्गदर्शन देंगे।'
                  )}
                </div>
              ) : (
                selectedFile.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded border p-3.5 ${
                      c.authorRole === 'lawyer'
                        ? 'border-amber-500/45 bg-amber-500/5'
                        : 'border-[var(--border-subtle)] bg-[var(--xp-panel-bg)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold ${
                          c.authorRole === 'lawyer'
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {c.authorStageName}{' '}
                        {c.authorRole === 'lawyer' && (
                          <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-400">
                            {t('Advocate', 'Advocate', 'अधिवक्ता')}
                          </span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[var(--text-secondary)]">
                        <ThumbsUp className="h-3 w-3" />
                        {c.likesCount}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-primary)]">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showJolly && <JollyTypewriter />}

      {composerOpen && (
        <XpWindow
          title={t(
            'New_Complaint_File.txt — Lodge in Court of People',
            'New_Complaint_File.txt — Court of People Mein Lodge Karein',
            'नई_शिकायत_फ़ाइल.txt — जनता की अदालत में दर्ज करें'
          )}
          icon={<XpNotepadIcon className="h-4 w-4 shrink-0" />}
        >
          <form onSubmit={handlePublish} className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {t(
                  'Create New Diary File & Lodge Publicly',
                  'Nayi Diary File Banayein & Public Mein Lodge Karein',
                  'नई डायरी फ़ाइल बनाएं और सार्वजनिक रूप से दर्ज करें'
                )}
              </h2>

              <button
                type="button"
                onClick={() => setPreviewDraftMasked((v) => !v)}
                className={`xp-btn px-3 py-1.5 text-xs ${previewDraftMasked ? 'xp-btn-gold' : ''}`}
              >
                {previewDraftMasked ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>
                  {previewDraftMasked
                    ? t('Public Blurred Preview ON', 'Blurred Preview ON', 'सार्वजनिक धुंधला रूप चालू')
                    : t('Preview Public View', 'Public View Dekhein', 'सार्वजनिक रूप देखें')}
                </span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                  {t('Category', 'Category', 'श्रेणी')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="xp-input w-full px-3 py-2 text-xs font-semibold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {translateCategory(c, lang)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                  {t('File Caption / Headline', 'File Caption / Headline', 'फ़ाइल का शीर्षक')}
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t(
                    'e.g., PAN card stolen near Naveen Market',
                    'jaise: Naveen Market ke paas PAN card chori',
                    'जैसे: नवीन मार्केट के पास पैन कार्ड चोरी'
                  )}
                  className="xp-input w-full px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>

            {previewDraftMasked ? (
              <div className="xp-panel p-4 text-sm font-medium leading-relaxed text-[var(--text-primary)]">
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    {t('Exact Public View (Click blurred tags to test funny numbers)', 'Public View (Blurred tags par click karein)', 'सार्वजनिक रूप (धुंधले टैग पर क्लिक करके जांचें)')}
                  </span>
                </div>
                <p>
                  <ClickableBlurredText
                    text={computeClientMaskPreview(rawContent || 'Write your incident first to preview...')}
                  />
                </p>
              </div>
            ) : (
              <textarea
                required
                rows={5}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder={t(
                  'Write freely in your notebook. Real amounts, PAN numbers, and your name are masked automatically in public...',
                  'Apni notebook mein khulkar likhein. Asli naam aur paise public mein apne aap blur ho jayenge...',
                  'अपनी नोटबुक में खुलकर लिखें। आपका असली नाम, पैन नंबर और पैसों की राशि सार्वजनिक पोस्ट में अपने आप धुंधली (Blur) हो जाएगी...'
                )}
                className="xp-input w-full p-3 text-sm font-medium leading-relaxed"
              />
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setComposerOpen(false)} className="xp-btn px-4 py-2 text-xs">
                {t('Cancel', 'Radd Karein', 'रद्द करें')}
              </button>
              <button type="submit" disabled={posting} className="xp-btn xp-btn-start px-5 py-2 text-xs">
                <Send className="h-3.5 w-3.5" />
                <span>
                  {posting
                    ? t('Saving...', 'Save ho raha hai...', 'सेव हो रहा है...')
                    : t('Save File & Lodge Anonymously', 'Save & Lodge Karein', 'फ़ाइल सेव करें और गुप्त रूप से दर्ज करें')}
                </span>
              </button>
            </div>
          </form>
        </XpWindow>
      )}
    </div>
  );
};

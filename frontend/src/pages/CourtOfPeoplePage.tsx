import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, MessageSquarePlus, Scale, Search, ShieldCheck, ThumbsUp, User } from 'lucide-react';
import { DemoRazorpayModal } from '../components/DemoRazorpayModal';
import { XpFolderIcon, XpScalesIcon, XpWindow } from '../components/XpIcons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';

interface CommentItem {
  id: string;
  content: string;
  likesCount: number;
  importanceScore: number;
  createdAt: string;
  authorId: string;
  authorStageName: string;
  authorRole: 'client' | 'lawyer' | 'admin';
  authorAvatar: string | null;
}

interface ThreadItem {
  id: string;
  category: string;
  title: string;
  maskedContent: string;
  aliases: Record<string, string>;
  upvotes: number;
  createdAt: string;
  authorStageName: string;
  authorRole: string;
  comments: CommentItem[];
}

const CATEGORIES = ['All', 'Marital', 'Criminal', 'Theft & Cyber', 'Property', 'Consumer', 'Labour', 'Financial'];

const FUNNY_REPRESENTATIONAL_AMOUNTS = [
  '₹4,20,000',
  '₹69,000',
  '₹42,069',
  '₹6,90,420',
  '₹4,200',
  '₹69,420',
];

function renderMaskedText(text: string, blurOn: boolean) {
  const parts = text.split(/(\[BLURRED AMOUNT: [^\]]+\]|\[Alias: [^\]]+\]|\[MASKED-[^\]]+\])/g);
  let amountCounter = 0;

  return parts.map((part, i) => {
    if (part.startsWith('[BLURRED AMOUNT:')) {
      const funnyNum = FUNNY_REPRESENTATIONAL_AMOUNTS[amountCounter++ % FUNNY_REPRESENTATIONAL_AMOUNTS.length];
      if (blurOn) {
        return (
          <span
            key={i}
            className="masked-blur mx-0.5 inline-block rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-700 dark:text-amber-300"
            title="Blur ON — sensitive amount hidden"
          >
            {part.replace('[BLURRED AMOUNT: ', '').replace(']', '')}
          </span>
        );
      }
      return (
        <span
          key={i}
          className="mx-0.5 inline-block rounded border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 font-mono text-xs font-extrabold text-amber-800 dark:text-amber-300"
          title="Representational funny amount — real number stays private!"
        >
          {funnyNum} <span className="text-[9px] font-sans font-semibold opacity-75">(rep.)</span>
        </span>
      );
    }
    if (part.startsWith('[Alias:')) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-block rounded bg-blue-500/15 px-1.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300"
        >
          {part.replace('[Alias: ', '').replace(']', '')}
        </span>
      );
    }
    if (part.startsWith('[MASKED-')) {
      return (
        <span
          key={i}
          className={`${blurOn ? 'masked-blur' : ''} mx-0.5 rounded bg-red-500/15 px-1 font-mono text-xs font-bold text-red-600`}
        >
          {blurOn ? part : 'ID-420-69'}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export const CourtOfPeoplePage: React.FC = () => {
  const { maskMode, token, user, t } = useApp();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [razorpayTarget, setRazorpayTarget] = useState<string | undefined>(undefined);
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (search.trim()) params.set('q', search.trim());
      const res = await apiFetch<{ threads: ThreadItem[] }>(`/threads?${params.toString()}`);
      setThreads(res.threads);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [category]);

  const handleLikeComment = async (commentId: string) => {
    if (!token) {
      alert(t('Sign in to upvote helpful legal answers!', 'Madadgar jawab like karne ke liye Sign In karein!'));
      return;
    }
    await apiFetch(`/threads/comments/${commentId}/like`, { method: 'POST' }, token);
    loadThreads();
  };

  const handlePostComment = async (threadId: string) => {
    const content = (commentInputs[threadId] || '').trim();
    if (!content) return;
    await apiFetch(
      `/threads/${threadId}/comments`,
      { method: 'POST', body: JSON.stringify({ content }) },
      token
    );
    setCommentInputs((prev) => ({ ...prev, [threadId]: '' }));
    loadThreads();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <XpWindow
        title="Court_of_People.exe — Public Anonymous Legal Commons"
        icon={<XpScalesIcon className="h-4 w-4 shrink-0" />}
      >
        <div className="p-5 space-y-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {t('The Court of People', 'Court of People')}
              </h1>
              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                {t(
                  'Real matters stripped of private details. Citizens appear in blue with zero photos; verified advocates appear in gold.',
                  'Asli samasyaayein bina kisi private jaankari ke. Clients bina photo ke aur Wakeel gold badge mein dikhte hain.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadThreads()}
                  placeholder={t('Search matters...', 'Samasya khojein...')}
                  className="xp-input py-1.5 pl-8 pr-3 text-xs font-medium"
                />
              </div>
              <Link
                to={user ? '/client/dashboard' : '/auth?mode=register&role=client'}
                className="xp-btn xp-btn-start px-3.5 py-1.5 text-xs"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>{t('Lodge Matter', 'Post Karein')}</span>
              </Link>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 border-t border-[var(--border-subtle)] pt-3.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`xp-btn px-3 py-1 text-xs ${
                  category === cat ? 'xp-btn-primary' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </XpWindow>

      {/* Threads List */}
      <div className="space-y-5">
        {loading ? (
          <div className="xp-panel p-10 text-center text-xs font-bold text-[var(--text-secondary)]">
            {t('Loading Court of People threads...', 'Court of People khul rahi hai...')}
          </div>
        ) : threads.length === 0 ? (
          <div className="xp-panel p-10 text-center text-xs font-bold text-[var(--text-secondary)]">
            {t('No matters found in this category.', 'Is category mein koi matter nahi mila.')}
          </div>
        ) : (
          threads.map((thread) => (
            <XpWindow
              key={thread.id}
              title={`Case_File — ${thread.category} • Posted by ${thread.authorStageName}`}
              icon={<XpFolderIcon className="h-4 w-4 shrink-0" />}
            >
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                      <User className="h-3 w-3" />
                      {thread.authorStageName}
                    </span>
                    <span className="xp-panel px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-accent)]">
                      {thread.category}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[var(--text-secondary)]">
                    {thread.upvotes} {t('citizens stood with this', 'log saath hain')}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-bold text-[var(--text-primary)] sm:text-xl">
                  {thread.title}
                </h2>

                <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
                  {renderMaskedText(thread.maskedContent, maskMode)}
                </p>

                {/* Sorted Comments */}
                <div className="mt-5 space-y-3 border-t border-[var(--border-subtle)] pt-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {t('Responses Sorted by Helpfulness & Importance', 'Madadgar Jawab (Importance Ke Aadhar Par)')}
                  </div>

                  {thread.comments.map((c) => {
                    const isLawyer = c.authorRole === 'lawyer';
                    return (
                      <div
                        key={c.id}
                        className={`rounded border p-3.5 ${
                          isLawyer
                            ? 'border-amber-500/45 bg-amber-500/5'
                            : 'border-[var(--border-subtle)] bg-[var(--xp-panel-bg)]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isLawyer && c.authorAvatar && (
                              <img
                                src={c.authorAvatar}
                                alt={c.authorStageName}
                                className="h-6 w-6 rounded-sm border border-amber-500 object-cover"
                              />
                            )}
                            <span
                              className={`text-xs font-bold ${
                                isLawyer ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {c.authorStageName}
                            </span>
                            {isLawyer && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck className="h-3 w-3" />
                                Advocate
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isLawyer && (
                              <button
                                onClick={() => {
                                  setRazorpayTarget(c.authorStageName);
                                  setRazorpayOpen(true);
                                }}
                                className="xp-btn xp-btn-gold px-2.5 py-0.5 text-[11px]"
                              >
                                <Scale className="h-3 w-3" />
                                <span>{t('Reach Out Directly', 'Seedha Sampark')}</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleLikeComment(c.id)}
                              className="xp-btn px-2.5 py-0.5 text-[11px]"
                            >
                              <ThumbsUp className="h-3 w-3 text-[var(--text-accent)]" />
                              <span>{c.likesCount}</span>
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--text-primary)]">
                          {c.content}
                        </p>
                      </div>
                    );
                  })}

                  {user ? (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[thread.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [thread.id]: e.target.value }))
                        }
                        placeholder={t('Share helpful legal guidance or experience...', 'Madadgar salaah ya anubhav likhein...')}
                        className="xp-input flex-1 px-3 py-1.5 text-xs font-medium"
                      />
                      <button
                        onClick={() => handlePostComment(thread.id)}
                        className="xp-btn xp-btn-primary px-4 py-1.5 text-xs"
                      >
                        {t('Reply', 'Bhejein')}
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-accent)] hover:underline"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>{t('Sign in to comment & help this citizen', 'Madad karne ke liye Sign In karein')}</span>
                    </Link>
                  )}
                </div>
              </div>
            </XpWindow>
          ))
        )}
      </div>

      <DemoRazorpayModal
        open={razorpayOpen}
        onClose={() => setRazorpayOpen(false)}
        attorneyName={razorpayTarget}
      />
    </div>
  );
};

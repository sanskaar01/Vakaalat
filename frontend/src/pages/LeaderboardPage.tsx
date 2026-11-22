import React, { useEffect, useState } from 'react';
import { Eye, Flame, GraduationCap, MapPin, Scale, ShieldCheck, ThumbsUp } from 'lucide-react';
import { DemoRazorpayModal } from '../components/DemoRazorpayModal';
import { XpTrophyIcon, XpWindow } from '../components/XpIcons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';

interface LeaderboardLawyer {
  rank: number;
  id: string;
  stageName: string;
  avatarUrl: string | null;
  college: string;
  experienceYears: number;
  domains: string[];
  city: string;
  verificationStatus: string;
  profileViews: number;
  totalLikes: number;
  bioExcerpt: string;
  bioText: string;
}

function getOrdinal(n: number): string {
  const s = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const LeaderboardPage: React.FC = () => {
  const { user, t } = useApp();
  const [lawyers, setLawyers] = useState<LeaderboardLawyer[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [razorpayTarget, setRazorpayTarget] = useState<string | undefined>(undefined);
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  useEffect(() => {
    apiFetch<{ lawyers: LeaderboardLawyer[] }>('/lawyers/leaderboard').then((res) =>
      setLawyers(res.lawyers)
    );
  }, []);

  const handleExpand = async (lawyer: LeaderboardLawyer) => {
    if (expandedId === lawyer.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(lawyer.id);
    await apiFetch(`/lawyers/${lawyer.id}/view`, { method: 'POST' }).catch(() => {});
    setLawyers((prev) =>
      prev.map((l) => (l.id === lawyer.id ? { ...l, profileViews: l.profileViews + 1 } : l))
    );
  };

  const loggedInLawyer =
    user?.role === 'lawyer' ? lawyers.find((l) => l.id === user.id) : undefined;

  const orderedLawyers = loggedInLawyer
    ? [loggedInLawyer, ...lawyers.filter((l) => l.id !== loggedInLawyer.id)]
    : lawyers;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <XpWindow
        title="Attorney_Leaderboard.exe — Merit Ranking (Kanpur)"
        icon={<XpTrophyIcon className="h-4 w-4 shrink-0" />}
      >
        <div className="p-5">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {t('Attorney Leaderboard', 'Wakeel Leaderboard')}
          </h1>

          {loggedInLawyer ? (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded border border-amber-500/60 bg-amber-500/15 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>
                YOU ARE THIS WEEK&apos;S {getOrdinal(loggedInLawyer.rank)} MOST HOT LAWYER IN TOWN
              </span>
            </div>
          ) : (
            <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              {t(
                'Sorted strictly by helpful likes earned on Court of People answers. Every advocate wrote a 1,700+ character story without copy-pasting.',
                'Court of People mein madadgar jawabon par mile likes ke aadhar par ranking.'
              )}
            </p>
          )}
        </div>
      </XpWindow>

      <div className="space-y-4">
        {orderedLawyers.map((lawyer) => {
          const isExpanded = expandedId === lawyer.id;
          const isMe = loggedInLawyer?.id === lawyer.id;
          return (
            <div
              key={lawyer.id}
              className={`xp-window p-5 transition ${
                isMe ? 'ring-2 ring-amber-500/70' : ''
              }`}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="xp-btn xp-btn-gold h-10 w-10 shrink-0 text-sm font-extrabold">
                    #{lawyer.rank}
                  </div>
                  {lawyer.avatarUrl && (
                    <img
                      src={lawyer.avatarUrl}
                      alt={lawyer.stageName}
                      className="h-12 w-12 shrink-0 rounded border-2 border-[var(--xp-window-border)] object-cover"
                    />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        {lawyer.stageName}
                      </h2>
                      {isMe && (
                        <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black">
                          YOU (PINNED)
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        {lawyer.verificationStatus === 'verified' ? 'Video CV Verified' : 'Pending'}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                        {lawyer.college}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                        {lawyer.city} • {lawyer.experienceYears} yrs
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lawyer.domains.map((d) => (
                        <span
                          key={d}
                          className="xp-panel px-2 py-0.5 text-[10px] font-bold text-[var(--text-primary)]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="inline-flex items-center gap-1 text-[var(--text-accent)]">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {lawyer.totalLikes} Likes
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                      <Eye className="h-3.5 w-3.5" />
                      {lawyer.profileViews} Views
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExpand(lawyer)}
                      className="xp-btn px-3 py-1.5 text-xs"
                    >
                      {isExpanded ? t('Hide Story', 'Band Karein') : t('Read Full Story', 'Poori Story')}
                    </button>
                    <button
                      onClick={() => {
                        setRazorpayTarget(lawyer.stageName);
                        setRazorpayOpen(true);
                      }}
                      className="xp-btn xp-btn-gold px-3.5 py-1.5 text-xs"
                    >
                      <Scale className="h-3.5 w-3.5" />
                      <span>{t('Reach Out Directly', 'Sampark Karein')}</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {isExpanded ? lawyer.bioText : lawyer.bioExcerpt}
              </p>
            </div>
          );
        })}
      </div>

      <DemoRazorpayModal
        open={razorpayOpen}
        onClose={() => setRazorpayOpen(false)}
        attorneyName={razorpayTarget}
      />
    </div>
  );
};

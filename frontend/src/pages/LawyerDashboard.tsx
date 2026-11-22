import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock, Eye, Scale, ShieldCheck, ThumbsUp, Users } from 'lucide-react';
import { XpFolderIcon, XpScalesIcon, XpWindow } from '../components/XpIcons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';

interface DashboardData {
  profile: {
    id: string;
    stageName: string;
    realName: string;
    avatarUrl: string | null;
    college: string;
    experienceYears: number;
    domains: string[];
    city: string;
    verificationStatus: string;
    profileViews: number;
    totalLikes: number;
    bioLength: number;
  };
  possibleClients: {
    id: string;
    category: string;
    title: string;
    maskedContent: string;
    upvotes: number;
    authorStageName: string;
  }[];
  mostTimeSpentVisitors: {
    id: string;
    visitorStageName: string;
    domainInterest: string;
    secondsSpent: number;
    visitedAt: string;
  }[];
}

export const LawyerDashboard: React.FC = () => {
  const { token, t } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'possible_clients' | 'most_time'>('possible_clients');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiFetch<DashboardData>('/lawyers/dashboard', {}, token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm font-bold text-red-500">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-sm font-semibold text-[var(--text-secondary)]">
        {t('Opening Advocate Chambers...', 'Chambers khul rahe hain...')}
      </div>
    );
  }

  const { profile, possibleClients, mostTimeSpentVisitors } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <XpWindow
        title={`Advocate_Chambers.exe — ${profile.stageName}`}
        icon={<XpScalesIcon className="h-4 w-4 shrink-0" />}
      >
        <div className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.stageName}
                  className="h-16 w-16 rounded border-2 border-[var(--xp-window-border)] object-cover"
                />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-accent)]">
                    Advocate Chambers
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    {profile.verificationStatus === 'verified' ? 'Video CV Verified' : 'Under Review'}
                  </span>
                </div>
                <h1 className="mt-0.5 text-2xl font-bold text-[var(--text-primary)]">
                  {profile.stageName}
                </h1>
                <p className="text-xs font-medium text-[var(--text-secondary)]">
                  {profile.college} • {profile.experienceYears} yrs • {profile.city} ({profile.bioLength} char story)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="xp-panel px-5 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-accent)]">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Profile Views</span>
                </div>
                <div className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">
                  {profile.profileViews.toLocaleString()}
                </div>
              </div>

              <div className="xp-panel px-5 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  <ThumbsUp className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                  <span>Likes</span>
                </div>
                <div className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">
                  {profile.totalLikes}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5 border-t border-[var(--border-subtle)] pt-4">
            <button
              onClick={() => setActiveTab('possible_clients')}
              className={`xp-btn px-4 py-2 text-xs ${
                activeTab === 'possible_clients' ? 'xp-btn-primary' : ''
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Possible Clients ({possibleClients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('most_time')}
              className={`xp-btn px-4 py-2 text-xs ${
                activeTab === 'most_time' ? 'xp-btn-primary' : ''
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{t('People Who Spent Most Time On You', 'Sabse Zyada Samay Bitane Wale')}</span>
            </button>

            <Link to="/leaderboard" className="xp-btn xp-btn-gold px-4 py-2 text-xs">
              <Award className="h-3.5 w-3.5" />
              <span>{t('View My Leaderboard Rank', 'Leaderboard Rank Dekhein')}</span>
            </Link>
          </div>
        </div>
      </XpWindow>

      <div>
        {activeTab === 'possible_clients' ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Matched to your domains ({profile.domains.join(', ')}). Answer helpfully in the Court of People to earn likes and climb the Leaderboard.
            </p>
            {possibleClients.map((thread) => (
              <XpWindow
                key={thread.id}
                title={`Possible_Client — ${thread.category}`}
                icon={<XpFolderIcon className="h-4 w-4 shrink-0" />}
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                        {thread.authorStageName}
                      </span>
                      <span className="xp-panel px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--text-accent)]">
                        {thread.category}
                      </span>
                    </div>
                    <Link to="/court" className="xp-btn xp-btn-start px-3 py-1.5 text-xs">
                      <Scale className="h-3 w-3" />
                      <span>{t('Help in Court of People', 'Jawab Dein')}</span>
                    </Link>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-[var(--text-primary)]">
                    {thread.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                    {thread.maskedContent}
                  </p>
                </div>
              </XpWindow>
            ))}
          </div>
        ) : (
          <XpWindow
            title="Profile_Reading_Time_Log.csv — Citizens Most Engaged With Your Story"
            icon={<XpFolderIcon className="h-4 w-4 shrink-0" />}
          >
            <div className="divide-y divide-[var(--border-subtle)]">
              {mostTimeSpentVisitors.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3.5 text-xs">
                  <div>
                    <div className="font-bold text-blue-700 dark:text-blue-300">{v.visitorStageName}</div>
                    <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                      Interested in: {v.domainInterest}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-[var(--text-primary)]">
                      {Math.floor(v.secondsSpent / 60)}m {v.secondsSpent % 60}s
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">reading time</div>
                  </div>
                </div>
              ))}
            </div>
          </XpWindow>
        )}
      </div>
    </div>
  );
};

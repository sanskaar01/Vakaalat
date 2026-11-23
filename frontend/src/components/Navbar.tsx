import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VakaalatLogo } from './VakaalatLogo';
import { XpFolderIcon, XpScalesIcon, XpTrophyIcon } from './XpIcons';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, lang, setLang, user, logout, t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navBtnClass = (path: string) =>
    `xp-btn px-3 py-1.5 text-xs ${
      location.pathname === path ? 'xp-btn-primary' : ''
    }`;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--xp-window-border)] bg-[var(--bg-surface)] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center text-[var(--text-primary)] hover:opacity-90">
            <VakaalatLogo className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link to="/court" className={navBtnClass('/court')}>
              <XpScalesIcon className="h-4 w-4" />
              <span>{t('Court of People', 'Janta Ki Adalat', 'जनता की अदालत')}</span>
            </Link>
            <Link to="/leaderboard" className={navBtnClass('/leaderboard')}>
              <XpTrophyIcon className="h-4 w-4" />
              <span>{t('Leaderboard', 'Wakeel Leaderboard', 'वकील लीडरबोर्ड')}</span>
            </Link>
            {user && (
              <Link
                to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'}
                className={navBtnClass(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')}
              >
                <XpFolderIcon className="h-4 w-4" />
                <span>
                  {user.role === 'lawyer'
                    ? t('Advocate Chambers', 'Wakeel Chambers', 'वकील चैंबर')
                    : t('Personal Diary', 'Personal Diary', 'मेरी गुप्त डायरी')}
                </span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 3-Language Selector: EN | हिंदी | हिंग्लिश */}
          <div className="inline-flex rounded border border-[var(--border-subtle)] bg-[var(--xp-panel-bg)] p-0.5">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                lang === 'en' ? 'bg-[#2b6be0] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                lang === 'hi' ? 'bg-[#2b6be0] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLang('hinglish')}
              className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                lang === 'hinglish' ? 'bg-[#2b6be0] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              हिंग्लिश
            </button>
          </div>

          {/* Sun / Moon Theme Switch */}
          <button
            onClick={toggleTheme}
            className={`xp-btn px-2.5 py-1.5 text-[11px] ${
              theme === 'dark' ? 'xp-btn-primary' : 'xp-btn-gold'
            }`}
            title={theme === 'dark' ? t('Night Mode', 'Night Mode', 'नाइट मोड') : t('Day Mode', 'Day Mode', 'डे मोड')}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('Moon', 'Chaand', 'चाँद')}</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('Sun', 'Suraj', 'सूरज')}</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')}
                className="hidden lg:inline-flex xp-btn px-2.5 py-1.5 text-xs"
              >
                <span className="max-w-[130px] truncate">{user.stageName}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="xp-btn p-1.5 hover:text-red-500"
                title={t('Sign Out', 'Logout', 'लॉग आउट')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="xp-btn xp-btn-start px-3 py-1.5 text-xs">
              {t('Sign In', 'Sign In', 'साइन इन')}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Phone Quick Navigation Bar (< 768px) */}
      <nav className="flex items-center justify-around gap-1.5 border-t border-[var(--border-subtle)] bg-[var(--xp-panel-bg)] px-2 py-1.5 md:hidden overflow-x-auto">
        <Link to="/" className={`${navBtnClass('/')} flex-1 py-1 text-[11px]`}>
          <span>{t('Home', 'Home', 'होम')}</span>
        </Link>
        <Link to="/court" className={`${navBtnClass('/court')} flex-1 py-1 text-[11px]`}>
          <XpScalesIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('Court', 'Adalat', 'अदालत')}</span>
        </Link>
        <Link to="/leaderboard" className={`${navBtnClass('/leaderboard')} flex-1 py-1 text-[11px]`}>
          <XpTrophyIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('Lawyers', 'Wakeel', 'वकील')}</span>
        </Link>
        {user && (
          <Link
            to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'}
            className={`${navBtnClass(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')} flex-1 py-1 text-[11px]`}
          >
            <XpFolderIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {user.role === 'lawyer'
                ? t('Chambers', 'Chambers', 'चैंबर')
                : t('Diary', 'Diary', 'डायरी')}
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
};

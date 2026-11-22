import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Languages, LogOut, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VakaalatLogo } from './VakaalatLogo';
import { XpFolderIcon, XpScalesIcon, XpTrophyIcon } from './XpIcons';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, lang, toggleLang, maskMode, toggleMaskMode, user, logout, t } = useApp();
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
              <span>{t('Court of People', 'Janta Ki Adalat')}</span>
            </Link>
            <Link to="/leaderboard" className={navBtnClass('/leaderboard')}>
              <XpTrophyIcon className="h-4 w-4" />
              <span>{t('Leaderboard', 'Leaderboard')}</span>
            </Link>
            {user && (
              <Link
                to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'}
                className={navBtnClass(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard')}
              >
                <XpFolderIcon className="h-4 w-4" />
                <span>
                  {user.role === 'lawyer'
                    ? t('Advocate Chambers', 'Chambers')
                    : t('Personal Diary', 'Personal Diary')}
                </span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Renamed to Blur ON / Blur OFF */}
          <button
            onClick={toggleMaskMode}
            className={`hidden sm:inline-flex xp-btn px-2.5 py-1.5 text-[11px] ${
              maskMode ? 'xp-btn-gold' : ''
            }`}
            title={t(
              'Blur ON hides sensitive amounts; Blur OFF shows funny representational numbers only',
              'Blur ON paise chhupata hai; Blur OFF funny representational numbers dikhata hai'
            )}
          >
            {maskMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{maskMode ? 'Blur ON' : 'Blur OFF'}</span>
          </button>

          <button
            onClick={toggleLang}
            className="xp-btn px-2.5 py-1.5 text-[11px]"
            title="Switch English / Hinglish"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{lang === 'en' ? 'EN' : 'हिंग्लिश'}</span>
          </button>

          {/* Sun / Moon Theme Representative Switch (replaces hanging clock) */}
          <button
            onClick={toggleTheme}
            className={`xp-btn px-2.5 py-1.5 text-[11px] ${
              theme === 'dark' ? 'xp-btn-primary' : 'xp-btn-gold'
            }`}
            title={theme === 'dark' ? 'Night Galaxy Mode — Click for Day Sun' : 'Day Sun Mode — Click for Night Galaxy'}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Moon</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sun</span>
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
                title={t('Sign Out', 'Logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="xp-btn xp-btn-start px-3.5 py-1.5 text-xs">
              {t('Sign In', 'Sign In')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

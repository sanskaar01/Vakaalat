import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { HINDI_DICTIONARY, LangMode } from '../lib/i18n';

export interface User {
  id: string;
  role: 'client' | 'lawyer' | 'admin';
  stageName: string;
  realName: string;
  email: string;
  avatarUrl: string | null;
  hasSubscription: boolean;
}

type ThemeMode = 'light' | 'dark';

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  lang: LangMode;
  setLang: (mode: LangMode) => void;
  toggleLang: () => void;
  t: (en: string, hinglish?: string, hi?: string) => string;
  isComputing: boolean;
  setIsComputing: (v: boolean) => void;
  scenicActive: boolean;
  triggerScenicBurst: (durationMs?: number) => void;
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function computeTimeBasedTheme(): ThemeMode {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manualTheme, setManualTheme] = useState<ThemeMode | null>(null);
  const [autoTheme, setAutoTheme] = useState<ThemeMode>(computeTimeBasedTheme);
  const [lang, setLang] = useState<LangMode>('en');
  const [isComputing, setIsComputing] = useState<boolean>(false);
  const [burstActive, setBurstActive] = useState<boolean>(false);
  const burstTimerRef = React.useRef<number | null>(null);

  const triggerScenicBurst = (durationMs = 10_000) => {
    setBurstActive(true);
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => {
      setBurstActive(false);
    }, durationMs);
  };

  const scenicActive = isComputing || burstActive;

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vakaalat_token'));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('vakaalat_user');
    return raw ? JSON.parse(raw) : null;
  });

  const theme = manualTheme ?? autoTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoTheme(computeTimeBasedTheme());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ user: User }>('/auth/me', {}, token);
      setUser(res.user);
      localStorage.setItem('vakaalat_user', JSON.stringify(res.user));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token && !user) {
      refreshUser();
    }
  }, [token]);

  const setAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('vakaalat_token', newToken);
    localStorage.setItem('vakaalat_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vakaalat_token');
    localStorage.removeItem('vakaalat_user');
  };

  const toggleTheme = () => {
    setManualTheme((prev) => ((prev ?? autoTheme) === 'dark' ? 'light' : 'dark'));
  };

  const toggleLang = () =>
    setLang((prev) => (prev === 'en' ? 'hi' : prev === 'hi' ? 'hinglish' : 'en'));

  const t = (en: string, hinglish?: string, hi?: string): string => {
    if (lang === 'en') return en;
    if (lang === 'hi') {
      return hi || HINDI_DICTIONARY[en] || hinglish || en;
    }
    return hinglish || HINDI_DICTIONARY[en] || en;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        lang,
        setLang,
        toggleLang,
        t,
        isComputing,
        setIsComputing,
        scenicActive,
        triggerScenicBurst,
        user,
        token,
        setAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Scale, Send, ShieldCheck, Users } from 'lucide-react';
import { JollyTypewriter } from '../components/JollyTypewriter';
import { VakaalatLogo } from '../components/VakaalatLogo';
import {
  XpFolderIcon,
  XpMailIcon,
  XpNotepadIcon,
  XpScalesIcon,
  XpShieldIcon,
  XpTrophyIcon,
  XpWindow,
} from '../components/XpIcons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';

export const LandingPage: React.FC = () => {
  const { t, autoThemeLabel } = useApp();
  const [stats, setStats] = useState({ clients: 50, lawyers: 10, threads: 12, comments: 36 });

  const [fbEmail, setFbEmail] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbSent, setFbSent] = useState(false);

  useEffect(() => {
    apiFetch<typeof stats>('/stats')
      .then(setStats)
      .catch(() => {});
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fbMessage.trim().length < 4) return;
    await apiFetch('/feedback', {
      method: 'POST',
      body: JSON.stringify({ email: fbEmail, message: fbMessage }),
    });
    setFbSent(true);
    setFbEmail('');
    setFbMessage('');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 space-y-10">
      {/* SECTION 1: HERO XP WINDOW */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <XpWindow
          title={`Vakaalat_Courtroom.exe — ${autoThemeLabel} • Kanpur, UP`}
          icon={<XpScalesIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="px-6 py-9 text-center sm:px-10 sm:py-12">
            <div className="mx-auto flex justify-center text-[var(--text-primary)]">
              <VakaalatLogo className="h-16 w-auto sm:h-20" />
            </div>

            <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
              {t(
                'You are seen. You are heard. Vakaalat is your backroom court.',
                'Aapki baat suni jayegi. Aapki pehchan gupt rahegi. Vakaalat aapki backroom court hai.'
              )}
            </h1>

            <p className="mx-auto mt-3.5 max-w-xl text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
              {t(
                'Legal help is a right—never a luxury. Speak freely without exposing your name, get immediate First-Aid Dhaarein and government portal steps, and stand before the Court of People.',
                'Kanooni madad aapka haq hai. Bina naam bataye apni baat rakhein, turant First-Aid Dhaarein aur sarkari portal steps paayein.'
              )}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/auth?mode=register&role=client"
                className="xp-btn xp-btn-start px-6 py-2.5 text-sm"
              >
                <XpShieldIcon className="h-4 w-4" />
                <span>{t('I need legal help', 'Mujhe kanooni madad chahiye')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/auth?mode=register&role=lawyer"
                className="xp-btn xp-btn-primary px-6 py-2.5 text-sm"
              >
                <XpScalesIcon className="h-4 w-4" />
                <span>{t('I provide legal help', 'Main kanooni madad deta hoon')}</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--border-subtle)] pt-5">
              <Link to="/court" className="xp-btn px-3.5 py-2 text-xs">
                <XpFolderIcon className="h-4 w-4" />
                <span>{t('Open Court of People', 'Court of People Kholein')}</span>
              </Link>
              <Link to="/leaderboard" className="xp-btn px-3.5 py-2 text-xs">
                <XpTrophyIcon className="h-4 w-4" />
                <span>{t('Attorney Leaderboard', 'Wakeel Leaderboard')}</span>
              </Link>
              <a href="#first-aid-desk" className="xp-btn px-3.5 py-2 text-xs">
                <XpNotepadIcon className="h-4 w-4" />
                <span>{t('Launch First-Aid Desk', 'First-Aid Desk Kholein')}</span>
              </a>
            </div>
          </div>

          <div className="xp-statusbar">
            <div className="flex flex-wrap items-center gap-4 font-semibold">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                {stats.clients}+ Anonymous Citizens
              </span>
              <span className="inline-flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                {stats.lawyers} Verified Kanpur Advocates
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                {stats.threads} Public Threads
              </span>
            </div>
            <span className="hidden sm:inline font-mono">Sun / Moon switches Day & Galaxy Mode</span>
          </div>
        </XpWindow>
      </motion.section>

      {/* SECTION 2: FIRST-AID LEGAL DESK */}
      <motion.section
        id="first-aid-desk"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="scroll-mt-20"
      >
        <JollyTypewriter />
      </motion.section>

      {/* SECTION 3: WHAT IS VAKAALAT? */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <XpWindow
          title="What_is_Vakaalat.txt — How Your Backroom Court Works"
          icon={<XpFolderIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
            <div className="xp-panel p-4">
              <XpShieldIcon className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                1. {t('Speak Without Fear', 'Bina Darr Ke Bolein')}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Clients never upload profile photos. Every citizen gets a celebrity alias and exact rupee amounts stay blurred in public.',
                  'Clients ki koi photo nahi hoti. Har nagrik ko celebrity alias milta hai aur paise public mein blurred rehte hain.'
                )}
              </p>
            </div>

            <div className="xp-panel p-4">
              <XpNotepadIcon className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                2. {t('Know Your Dhaarein', 'Apni Dhaarein Jaanein')}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Get immediate BNS, Constitution, Consumer & IT Act sections violated against you—plus hoverable "i" steps for official government portals.',
                  'BNS, Constitution aur Sarkari portals ke exact steps turant paayein.'
                )}
              </p>
            </div>

            <div className="xp-panel p-4">
              <XpScalesIcon className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                3. {t('Court of People', 'Janta Ki Adalat')}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Post your masked grievance publicly. Verified Kanpur advocates reply—ranked purely by helpful likes, never paid ads.',
                  'Apna masked matter post karein. Verified wakeel aur log aapki madad karte hain.'
                )}
              </p>
            </div>
          </div>
        </XpWindow>
      </motion.section>

      {/* SECTION 4: OUR VISION */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
      >
        <XpWindow
          title="Our_Vision.doc — Why We Built Vakaalat"
          icon={<XpScalesIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="px-6 py-8 text-center sm:px-10">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-accent)]">
              {t('Our Vision', 'Hamara Vision')}
            </span>
            <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-bold leading-snug text-[var(--text-primary)] sm:text-3xl">
              “If it sticks with you when you are alone, you might as well share it here.”
            </h2>
            <p className="mx-auto mt-3.5 max-w-2xl text-xs font-medium leading-relaxed text-[var(--text-secondary)] sm:text-sm">
              {t(
                'We dream of building a community that backs the emotion when you feel you have been wronged. Because life is so fast-paced, you often doubt yourself for feeling hurt—wondering if you are overreacting, or if you should stop cribbing and just move on. No. Stay anonymous, share it here, and listen to what others think. You are not alone.',
                'Hum ek aisi community banana chahte hain jo aapke dard ko validate kare. Tez zindagi mein log khud par shaq karne lagte hain ki kahin woh overreact toh nahi kar rahe. Agar koi baat akele mein aapko chubhti hai, toh yahan anonymous rehkar share karein. Aap akele nahi hain.'
              )}
            </p>
          </div>
        </XpWindow>
      </motion.section>

      {/* SECTION 5: FOOTER — WRITE TO US! HELP US HELP YOU */}
      <footer>
        <XpWindow
          title="Help_Us_Help_You.msg — Write to Us"
          icon={<XpMailIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-accent)]">
                HELP US HELP YOU
              </span>
              <h3 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                {t('Write to us! We are open to suggestions.', 'Humein likhein! Aapke sujhav hamare liye zaroori hain.')}
              </h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Missing a government portal, a legal category, or a feature that would make Vakaalat safer for you? Drop a note—every suggestion goes straight to our team.',
                  'Koi portal, category ya feature chahiye? Neeche likhein—har sujhav seedha hum tak pahunchta hai.'
                )}
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-2.5">
              {fbSent ? (
                <div className="xp-panel flex items-center gap-2 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{t('Thank you! Your suggestion has been saved.', 'Shukriya! Aapka sujhav save ho gaya hai.')}</span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={fbEmail}
                    onChange={(e) => setFbEmail(e.target.value)}
                    placeholder={t('Your email (optional — stay anonymous if you want)', 'Email (optional)')}
                    className="xp-input w-full px-3 py-2 text-xs font-medium"
                  />
                  <textarea
                    required
                    rows={3}
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder={t('Tell us how we can make Vakaalat better for you...', 'Bataiye hum Vakaalat ko aur behtar kaise bana sakte hain...')}
                    className="xp-input w-full p-3 text-xs font-medium"
                  />
                  <button type="submit" className="xp-btn xp-btn-primary px-4 py-2 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    <span>{t('Send Suggestion', 'Sujhav Bhejein')}</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </XpWindow>
      </footer>
    </div>
  );
};

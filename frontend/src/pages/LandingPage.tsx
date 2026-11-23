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
  const { t } = useApp();
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
      {/* SECTION 1: HERO XP WINDOW (Day Marble & Sun/Moon footer text removed) */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <XpWindow
          title={t(
            'Vakaalat_Courtroom.exe — Kanpur, UP',
            'Vakaalat_Courtroom.exe — Kanpur, UP',
            'वकालत_कोर्टरूम.exe — कानपुर, उत्तर प्रदेश'
          )}
          icon={<XpScalesIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="px-6 py-9 text-center sm:px-10 sm:py-12">
            <div className="mx-auto flex justify-center text-[var(--text-primary)]">
              <VakaalatLogo className="h-16 w-auto sm:h-20" />
            </div>

            <h1 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
              {t(
                'You are seen. You are heard. Vakaalat is your backroom court.',
                'Aapki baat suni jayegi. Aapki pehchan gupt rahegi. Vakaalat aapki backroom court hai.',
                'आपकी बात सुनी जाएगी। आपकी पहचान गुप्त रहेगी। वकालत आपकी अपनी अदालत है।'
              )}
            </h1>

            <p className="mx-auto mt-3.5 max-w-xl text-sm font-medium leading-relaxed text-[var(--text-secondary)]">
              {t(
                'Legal help is a right—never a luxury. Speak freely without exposing your name, get immediate First-Aid Dhaarein and government portal steps, and stand before the Court of People.',
                'Kanooni madad aapka haq hai. Bina naam bataye apni baat rakhein, turant First-Aid Dhaarein aur sarkari portal steps paayein, aur Janta Ki Adalat mein khade hon.',
                'कानूनी मदद आपका अधिकार है। बिना अपना नाम बताए अपनी समस्या लिखें, तुरंत लागू होने वाली धाराएं और सरकारी पोर्टल के कदम जानें, और जनता की अदालत से जुड़ें।'
              )}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/auth?mode=register&role=client"
                className="xp-btn xp-btn-start px-6 py-2.5 text-sm"
              >
                <XpShieldIcon className="h-4 w-4" />
                <span>{t('I need legal help', 'Mujhe kanooni madad chahiye', 'मुझे कानूनी मदद चाहिए')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/auth?mode=register&role=lawyer"
                className="xp-btn xp-btn-primary px-6 py-2.5 text-sm"
              >
                <XpScalesIcon className="h-4 w-4" />
                <span>{t('I provide legal help', 'Main kanooni madad deta hoon', 'मैं कानूनी मदद देता हूँ')}</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--border-subtle)] pt-5">
              <Link to="/court" className="xp-btn px-3.5 py-2 text-xs">
                <XpFolderIcon className="h-4 w-4" />
                <span>{t('Open Court of People', 'Court of People Kholein', 'जनता की अदालत खोलें')}</span>
              </Link>
              <Link to="/leaderboard" className="xp-btn px-3.5 py-2 text-xs">
                <XpTrophyIcon className="h-4 w-4" />
                <span>{t('Attorney Leaderboard', 'Wakeel Leaderboard', 'वकील लीडरबोर्ड')}</span>
              </Link>
              <a href="#first-aid-desk" className="xp-btn px-3.5 py-2 text-xs">
                <XpNotepadIcon className="h-4 w-4" />
                <span>{t('Launch First-Aid Desk', 'First-Aid Desk Kholein', 'फर्स्ट-एड लीगल डेस्क खोलें')}</span>
              </a>
            </div>
          </div>

          <div className="xp-statusbar">
            <div className="flex flex-wrap items-center gap-4 font-semibold">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                {stats.clients}+ {t('Anonymous Citizens', 'Gupt Nagrik', 'गुप्त नागरिक')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                {stats.lawyers} {t('Verified Kanpur Advocates', 'Kanpur Ke Verified Wakeel', 'कानपुर के सत्यापित वकील')}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                {stats.threads} {t('Public Threads', 'Public Matters', 'सार्वजनिक मामले')}
              </span>
            </div>
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
          title={t(
            'What_is_Vakaalat.txt — How Your Backroom Court Works',
            'Vakaalat_Kya_Hai.txt — Aapki Backroom Court Kaise Kaam Karti Hai',
            'वकालत_क्या_है.txt — आपकी अदालत कैसे काम करती है'
          )}
          icon={<XpFolderIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
            <div className="xp-panel p-4">
              <XpShieldIcon className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                1. {t('Speak Without Fear', 'Bina Darr Ke Bolein', 'बिना डर के अपनी बात रखें')}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Clients never upload profile photos. Every citizen gets a celebrity alias and exact rupee amounts stay blurred in public.',
                  'Clients ki koi photo nahi hoti. Har nagrik ko celebrity alias milta hai aur paise public mein blurred rehte hain (click karne par funny numbers dikhte hain).',
                  'नागरिकों की कोई प्रोफाइल फोटो नहीं होती। हर व्यक्ति को एक गुप्त उपनाम मिलता है और पैसों की राशि सार्वजनिक रूप से धुंधली (Blur) रहती है।'
                )}
              </p>
            </div>

            <div className="xp-panel p-4">
              <XpNotepadIcon className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                2. {t('Know Your Dhaarein', 'Apni Dhaarein Jaanein', 'अपनी कानूनी धाराएं जानें')}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Get immediate BNS, Constitution, Consumer & IT Act sections violated against you—plus hoverable "i" steps for official government portals.',
                  'BNS, Constitution aur Sarkari portals ke exact steps turant paayein—har portal ke "i" button par hover karke steps dekhein.',
                  'भारतीय न्याय संहिता (BNS), संविधान, उपभोक्ता और आईटी अधिनियम की वे धाराएं तुरंत जानें जो आपके खिलाफ तोड़ी गई हैं—साथ ही सरकारी पोर्टल के स्टेप-बाय-स्टेप निर्देश पाएं।'
                )}
              </p>
            </div>

            <div className="xp-panel p-4">
              <XpScalesIcon className="h-7 w-7" />
              <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                3. {t('Court of People', 'Janta Ki Adalat', 'जनता की अदालत')}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Post your masked grievance publicly. Verified Kanpur advocates reply—ranked purely by helpful likes, never paid ads.',
                  'Apna masked matter post karein. Verified wakeel aur log aapki madad karte hain—ranking sirf helpful likes se hoti hai.',
                  'अपनी पहचान छुपाकर अपनी शिकायत सार्वजनिक रूप से साझा करें। कानपुर के सत्यापित वकील आपकी मदद करते हैं—जिनकी रैंकिंग मददगार जवाबों के लाइक्स से तय होती है।'
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
          title={t(
            'Our_Vision.doc — Why We Built Vakaalat',
            'Hamara_Vision.doc — Vakaalat Kyun Banaya Gaya',
            'हमारा_उद्देश्य.doc — हमने वकालत क्यों बनाया'
          )}
          icon={<XpScalesIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="px-6 py-8 text-center sm:px-10">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-accent)]">
              {t('Our Vision', 'Hamara Vision', 'हमारा उद्देश्य')}
            </span>
            <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-bold leading-snug text-[var(--text-primary)] sm:text-3xl">
              {t(
                '“If it sticks with you when you are alone, you might as well share it here.”',
                '“Agar koi baat akele mein aapko chubhti hai, toh chup rehne ke bajaye yahan share karein.”',
                '“अगर कोई बात अकेले में आपको चुभती है, तो उसे चुपचाप सहने के बजाय यहाँ साझा करें।”'
              )}
            </h2>
            <p className="mx-auto mt-3.5 max-w-2xl text-xs font-medium leading-relaxed text-[var(--text-secondary)] sm:text-sm">
              {t(
                'We dream of building a community that backs the emotion when you feel you have been wronged. Because life is so fast-paced, you often doubt yourself for feeling hurt—wondering if you are overreacting, or if you should stop cribbing and just move on. No. Stay anonymous, share it here, and listen to what others think. You are not alone.',
                'Hum ek aisi community banana chahte hain jo aapke dard ko validate kare. Tez zindagi mein log khud par shaq karne lagte hain ki kahin woh overreact toh nahi kar rahe. Nahi—yahan anonymous rehkar share karein aur dekhein kanoon aur log kya kehte hain. Aap akele nahi hain.',
                'हम एक ऐसा समुदाय बनाना चाहते हैं जो आपके साथ हुए अन्याय में आपके साथ खड़ा हो। आज की तेज़ ज़िंदगी में लोग अक्सर खुद पर शक करने लगते हैं कि कहीं वे ज़्यादा तो नहीं सोच रहे। नहीं—अपनी पहचान गुप्त रखें, यहाँ अपनी बात लिखें, और देखें कि कानून और समाज आपके बारे में क्या कहता है। आप अकेले नहीं हैं।'
              )}
            </p>
          </div>
        </XpWindow>
      </motion.section>

      {/* SECTION 5: FOOTER — WRITE TO US! HELP US HELP YOU */}
      <footer>
        <XpWindow
          title={t(
            'Help_Us_Help_You.msg — Write to Us',
            'Help_Us_Help_You.msg — Humein Likhein',
            'हमारी_मदद_करें.msg — हमें लिखें'
          )}
          icon={<XpMailIcon className="h-4 w-4 shrink-0" />}
        >
          <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-accent)]">
                {t('HELP US HELP YOU', 'HELP US HELP YOU', 'हमारी मदद करें ताकि हम आपकी मदद कर सकें')}
              </span>
              <h3 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                {t(
                  'Write to us! We are open to suggestions.',
                  'Humein likhein! Aapke sujhav hamare liye zaroori hain.',
                  'हमें लिखें! आपके सुझावों का स्वागत है।'
                )}
              </h3>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Missing a government portal, a legal category, or a feature that would make Vakaalat safer for you? Drop a note—every suggestion goes straight to our team.',
                  'Koi sarkari portal, category ya feature chahiye? Neeche likhein—har sujhav seedha hamari team tak pahunchta hai.',
                  'क्या कोई सरकारी पोर्टल, कानूनी श्रेणी या सुविधा जोड़नी चाहिए जिससे वकालत आपके लिए और बेहतर बन सके? नीचे लिखें—आपका हर सुझाव सीधे हमारी टीम तक पहुँचता है।'
                )}
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-2.5">
              {fbSent ? (
                <div className="xp-panel flex items-center gap-2 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {t(
                      'Thank you! Your suggestion has been sent.',
                      'Shukriya! Aapka sujhav bhej diya gaya hai.',
                      'धन्यवाद! आपका सुझाव भेज दिया गया है।'
                    )}
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={fbEmail}
                    onChange={(e) => setFbEmail(e.target.value)}
                    placeholder={t(
                      'Your email (optional — stay anonymous if you want)',
                      'Aapka email (optional — chahein toh anonymous rahein)',
                      'आपका ईमेल (वैकल्पिक — चाहें तो गुप्त रहें)'
                    )}
                    className="xp-input w-full px-3 py-2 text-xs font-medium"
                  />
                  <textarea
                    required
                    rows={3}
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder={t(
                      'Tell us how we can make Vakaalat better for you...',
                      'Bataiye hum Vakaalat ko aapke liye aur behtar kaise bana sakte hain...',
                      'बताएं कि हम वकालत को आपके लिए और बेहतर कैसे बना सकते हैं...'
                    )}
                    className="xp-input w-full p-3 text-xs font-medium"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="submit" className="xp-btn xp-btn-primary px-4 py-2 text-xs">
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {t(
                          'Send Suggestion',
                          'Sujhav Bhejein',
                          'सुझाव भेजें'
                        )}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </XpWindow>
      </footer>
    </div>
  );
};

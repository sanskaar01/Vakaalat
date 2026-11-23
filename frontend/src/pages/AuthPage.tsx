import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Lock, Mic, MicOff, Phone, Scale, ShieldCheck, UserCheck, Video } from 'lucide-react';
import { XpShieldIcon, XpWindow } from '../components/XpIcons';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { translateCategory } from '../lib/i18n';

const DOMAINS = ['Marital', 'Criminal', 'Theft & Cyber', 'Property', 'Consumer', 'Labour', 'Financial'];

export const AuthPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, lang, t } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  );
  const [role, setRole] = useState<'client' | 'lawyer'>(
    params.get('role') === 'lawyer' ? 'lawyer' : 'client'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');

  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentInfo, setOtpSentInfo] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const [stageName, setStageName] = useState('');
  const [college, setCollege] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['Criminal']);
  const [inputMode, setInputMode] = useState<'typed' | 'voice'>('typed');
  const [bioText, setBioText] = useState('');
  const [videoCvUrl, setVideoCvUrl] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const minChars = inputMode === 'typed' ? 1700 : 2000;
  const fromJolly = params.get('from') === 'jolly';

  const toggleDomain = (d: string) => {
    setSelectedDomains((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSendOtp = async () => {
    setError('');
    setOtpSentInfo('');
    if (phone.replace(/\D/g, '').length < 10) {
      setError(
        t(
          'Enter a valid 10-digit phone number to receive OTP.',
          'OTP paane ke liye 10-ankon ka phone number daalein.',
          'OTP प्राप्त करने के लिए 10 अंकों का सही मोबाइल नंबर दर्ज करें।'
        )
      );
      return;
    }
    setSendingOtp(true);
    try {
      const res = await apiFetch<{ demoOtp: string; message: string }>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setOtpSentInfo(`OTP: ${res.demoOtp}`);
    } catch (err: any) {
      setError(err.message || 'Could not send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVoiceBio = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice recording requires Chrome/Edge.');
      return;
    }
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
      setBioText(text.trim());
    };
    rec.onend = () => setRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const autoLodgePendingDraft = async (authToken: string) => {
    const pending = sessionStorage.getItem('vakaalat_pending_draft');
    if (!pending) return;
    try {
      const draft = JSON.parse(pending);
      await apiFetch(
        '/threads',
        {
          method: 'POST',
          body: JSON.stringify({
            category: draft.category || 'Criminal',
            title: draft.title || 'New Citizen Grievance',
            rawContent: draft.rawContent,
          }),
        },
        authToken
      );
      sessionStorage.removeItem('vakaalat_pending_draft');
    } catch {
      // keep in sessionStorage
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await apiFetch<{ token: string; user: any }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setAuth(res.token, res.user);
        if (res.user.role === 'client') await autoLodgePendingDraft(res.token);
        navigate(res.user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
        return;
      }

      if (role === 'client') {
        const res = await apiFetch<{ token: string; user: any }>('/auth/register/client', {
          method: 'POST',
          body: JSON.stringify({
            realName,
            alias: alias.trim() || undefined,
            phone: phone.trim() || undefined,
            otp: otp.trim() || undefined,
            email,
            password,
          }),
        });
        setAuth(res.token, res.user);
        await autoLodgePendingDraft(res.token);
        navigate('/client/dashboard');
      } else {
        const res = await apiFetch<{ token: string; user: any }>('/auth/register/lawyer', {
          method: 'POST',
          body: JSON.stringify({
            realName,
            stageName: stageName || `Adv. ${realName}`,
            email,
            password,
            college,
            experienceYears: Number(experienceYears),
            domains: selectedDomains,
            city: 'Kanpur',
            inputMode,
            bioText,
            videoCvUrl,
          }),
        });
        setAuth(res.token, res.user);
        navigate('/lawyer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: demoEmail, password: 'Vakaalat@2026' }),
      });
      setAuth(res.token, res.user);
      if (res.user.role === 'client') await autoLodgePendingDraft(res.token);
      navigate(res.user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <XpWindow
        title={
          fromJolly
            ? t(
                'Lodge_Complaint_Account.exe — Quick Anonymous Verification',
                'Lodge_Complaint_Account.exe — Quick Gupt Verification',
                'शिकायत_दर्ज_अकाउंट.exe — त्वरित गुप्त सत्यापन'
              )
            : mode === 'login'
            ? t('Vakaalat_Login.exe — Protected Access', 'Vakaalat_Login.exe — Surakshit Login', 'वकालत_लॉगिन.exe — सुरक्षित प्रवेश')
            : t('Vakaalat_Register.exe — New Account', 'Vakaalat_Register.exe — Naya Account', 'वकालत_रजिस्टर.exe — नया अकाउंट')
        }
        icon={<XpShieldIcon className="h-4 w-4 shrink-0" />}
      >
        <div className="p-6 sm:p-8">
          {fromJolly && (
            <div className="mb-5 rounded border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {t(
                'Your analyzed complaint is ready! Enter your Name, Alias, Phone Number (OTP), and Gmail below — we will immediately lodge your complaint anonymously in the Court of People.',
                'Aapki complaint taiyaar hai! Neeche Name, Alias, Phone OTP aur Gmail bharein — aapki complaint turant Court of People mein lodge ho jayegi.',
                'आपकी शिकायत तैयार है! नीचे अपना नाम, गुप्त उपनाम (Alias), मोबाइल OTP और Gmail दर्ज करें — आपकी शिकायत तुरंत जनता की अदालत में गुप्त रूप से दर्ज हो जाएगी।'
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`xp-btn px-4 py-1.5 text-xs ${mode === 'login' ? 'xp-btn-primary' : ''}`}
              >
                {t('Sign In', 'Sign In Karein', 'साइन इन करें')}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`xp-btn px-4 py-1.5 text-xs ${mode === 'register' ? 'xp-btn-primary' : ''}`}
              >
                {t('Create Account', 'Naya Account Banayein', 'नया अकाउंट बनाएं')}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[var(--text-secondary)]">
                {t('Quick Demo:', 'Quick Demo:', 'डेमो लॉगिन:')}
              </span>
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen1@vakaalat.demo')}
                className="xp-btn px-2.5 py-1 text-[11px]"
              >
                {t('Demo Citizen', 'Demo Nagrik', 'डेमो नागरिक')}
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('raghav.mishra@vakaalat.in')}
                className="xp-btn xp-btn-gold px-2.5 py-1 text-[11px]"
              >
                {t('Demo Advocate', 'Demo Wakeel', 'डेमो वकील')}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`xp-panel flex items-center gap-3 p-4 text-left transition ${
                  role === 'client' ? 'border-2 border-[#2b6be0] ring-2 ring-[#2b6be0]/20' : ''
                }`}
              >
                <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {t('I need legal help', 'Mujhe kanooni madad chahiye', 'मुझे कानूनी मदद चाहिए')}
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                    {t('Name • Alias • Phone OTP • Gmail', 'Name • Alias • Phone OTP • Gmail', 'नाम • गुप्त उपनाम • मोबाइल OTP • Gmail')}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('lawyer')}
                className={`xp-panel flex items-center gap-3 p-4 text-left transition ${
                  role === 'lawyer' ? 'border-2 border-[#2b6be0] ring-2 ring-[#2b6be0]/20' : ''
                }`}
              >
                <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {t('I provide legal help', 'Main kanooni madad deta hoon', 'मैं कानूनी मदद देता हूँ')}
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)]">
                    {t('1,700+ char bio (no copy-paste) + Video CV', '1700+ char bio (no copy-paste) + Video CV', '1,700+ अक्षरों का परिचय (कॉपी-पेस्ट बंद) + वीडियो CV')}
                  </div>
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                    {t('Name (Strictly Private)', 'Asli Naam (Bilkul Gupt Rahega)', 'आपका असली नाम (पूरी तरह गुप्त रहेगा)')}
                  </label>
                  <input
                    required
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="e.g. Sanskar Sharma"
                    className="xp-input w-full px-3 py-2 text-sm font-medium"
                  />
                </div>

                {role === 'client' ? (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                      {t('Public Alias (Shown in Court of People)', 'Public Alias (Janta Ki Adalat Ke Liye)', 'सार्वजनिक गुप्त उपनाम (Alias)')}
                    </label>
                    <input
                      required
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="e.g. SilentKnight_420"
                      className="xp-input w-full px-3 py-2 text-sm font-medium"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                      {t('Public Stage Name', 'Public Stage Name', 'सार्वजनिक नाम (Advocate)')}
                    </label>
                    <input
                      required
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      placeholder="e.g. Adv. Vikramaditya Sen"
                      className="xp-input w-full px-3 py-2 text-sm font-medium"
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && role === 'client' && (
              <div className="xp-panel p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
                  <div className="sm:col-span-2">
                    <label className="mb-1 flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)]">
                      <Phone className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                      <span>
                        {t('Phone Number (For OTP Verification)', 'Phone Number (OTP Ke Liye)', 'मोबाइल नंबर (OTP सत्यापन के लिए)')}
                      </span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="xp-input w-full px-3 py-2 text-sm font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="xp-btn xp-btn-primary py-2 text-xs"
                  >
                    {sendingOtp
                      ? t('Sending...', 'Bhej rahe hain...', 'भेजा जा रहा है...')
                      : t('Send OTP', 'OTP Bhejein', 'OTP भेजें')}
                  </button>
                </div>

                {otpSentInfo && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{otpSentInfo}</span>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                    {t('Enter 6-Digit OTP', '6-Ankon Ka OTP Daalein', '6 अंकों का OTP दर्ज करें')}
                  </label>
                  <input
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="xp-input w-full max-w-xs px-3 py-2 font-mono text-sm font-bold tracking-widest"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                  {t('Gmail / Email', 'Gmail / Email', 'Gmail / ईमेल')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="xp-input w-full px-3 py-2 text-sm font-medium"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                  {t('Password', 'Password', 'पासवर्ड')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="xp-input w-full px-3 py-2 text-sm font-medium"
                />
              </div>
            </div>

            {mode === 'register' && role === 'lawyer' && (
              <div className="xp-panel space-y-4 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-accent)]">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {t(
                      'Attorney Authenticity Gate: 1,700+ chars typed (Copy-Paste disabled)',
                      'Wakeel Verification: 1,700+ chars likhein (Copy-Paste band hai)',
                      'वकील प्रामाणिकता जांच: 1,700+ अक्षर टाइप करें (कॉपी-पेस्ट बंद है)'
                    )}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                      {t('Law College / University', 'Law College / University', 'लॉ कॉलेज / विश्वविद्यालय')}
                    </label>
                    <input
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. RMLNLU Lucknow / CSJMU Kanpur"
                      className="xp-input w-full px-3 py-2 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                      {t('Experience (Years)', 'Anubhav (Saal)', 'अनुभव (वर्ष)')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="xp-input w-full px-3 py-2 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                    {t('Practice Domains', 'Kanooni Kshetra', 'वकालत के क्षेत्र')}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DOMAINS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDomain(d)}
                        className={`xp-btn px-3 py-1 text-xs ${
                          selectedDomains.includes(d) ? 'xp-btn-primary' : ''
                        }`}
                      >
                        {translateCategory(d, lang)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                    <Video className="h-3.5 w-3.5 text-[var(--text-accent)]" />
                    <span>
                      {t(
                        'Selfie Video of Degree / Day-in-My-Life Video CV URL',
                        'Degree Selfie Video ya Video CV Link',
                        'डिग्री सेल्फी वीडियो या वीडियो CV लिंक'
                      )}
                    </span>
                  </label>
                  <input
                    value={videoCvUrl}
                    onChange={(e) => setVideoCvUrl(e.target.value)}
                    placeholder="https://..."
                    className="xp-input w-full px-3 py-2 text-sm font-medium"
                  />
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setInputMode('typed')}
                        className={`xp-btn px-3 py-1 text-xs ${inputMode === 'typed' ? 'xp-btn-primary' : ''}`}
                      >
                        {t('Type Bio (1,700+ chars)', 'Type Karein (1,700+ chars)', 'टाइप करें (1,700+ अक्षर)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('voice')}
                        className={`xp-btn px-3 py-1 text-xs ${inputMode === 'voice' ? 'xp-btn-primary' : ''}`}
                      >
                        {t('Record Voice (2,000+ chars)', 'Bolein (2,000+ chars)', 'बोलकर रिकॉर्ड करें (2,000+ अक्षर)')}
                      </button>
                    </div>

                    <span
                      className={`font-mono text-xs font-bold ${
                        bioText.trim().length >= minChars ? 'text-emerald-600' : 'text-[var(--text-accent)]'
                      }`}
                    >
                      {bioText.trim().length} / {minChars}
                    </span>
                  </div>

                  {inputMode === 'voice' && (
                    <button
                      type="button"
                      onClick={handleVoiceBio}
                      className="xp-btn mb-2 px-3 py-1.5 text-xs"
                    >
                      {recording ? <MicOff className="h-3.5 w-3.5 text-red-500" /> : <Mic className="h-3.5 w-3.5" />}
                      <span>
                        {recording
                          ? t('Stop Recording', 'Rokein', 'रिकॉर्डिंग रोकें')
                          : t('Start Voice Recording', 'Bolein', 'वॉइस रिकॉर्डिंग शुरू करें')}
                      </span>
                    </button>
                  )}

                  <textarea
                    rows={6}
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    onPaste={(e) => {
                      e.preventDefault();
                      setError(
                        t(
                          'Copy-pasting is disabled for attorney verification.',
                          'Copy-paste band hai, kripya khud likhein.',
                          'वकील सत्यापन के लिए कॉपी-पेस्ट बंद है, कृपया स्वयं लिखें।'
                        )
                      );
                    }}
                    placeholder={t(
                      'Write about your college journey, courtroom experience, and how you aim to help ordinary citizens...',
                      'Apne college, court ke anubhav aur logon ki madad ke baare mein likhein...',
                      'अपने लॉ कॉलेज, कोर्ट के अनुभव और आम नागरिकों की मदद करने के उद्देश्य के बारे में विस्तार से लिखें...'
                    )}
                    className="xp-input w-full p-3 text-xs font-medium leading-relaxed"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs font-bold text-red-500">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {t('Zero identity exposure without consent', 'Bina marzi naam hidden', 'बिना अनुमति आपकी पहचान कभी साझा नहीं होगी')}
                </span>
              </span>

              <button
                type="submit"
                disabled={loading}
                className="xp-btn xp-btn-start px-6 py-2 text-xs disabled:opacity-60"
              >
                {loading
                  ? t('Please wait...', 'Kripya pratiksha karein...', 'कृपया प्रतीक्षा करें...')
                  : mode === 'login'
                  ? t('Enter Vakaalat', 'Andar Aayein', 'वकालत में प्रवेश करें')
                  : fromJolly
                  ? t('Verify & Lodge Complaint', 'Verify & Lodge Karein', 'सत्यापित करें और शिकायत दर्ज करें')
                  : t('Create Protected Account', 'Account Banayein', 'सुरक्षित अकाउंट बनाएं')}
              </button>
            </div>
          </form>
        </div>
      </XpWindow>
    </div>
  );
};

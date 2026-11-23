import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Lock, Shield, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../lib/api';
import { XpShieldIcon } from './XpIcons';

interface Props {
  open: boolean;
  onClose: () => void;
  attorneyName?: string;
}

export const DemoRazorpayModal: React.FC<Props> = ({ open, onClose, attorneyName }) => {
  const { token, user, refreshUser, t } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'vakaalat-direct-monthly' | 'vakaalat-shield-quarterly'>(
    'vakaalat-direct-monthly'
  );
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handlePayDemo = async () => {
    if (!token || !user) {
      setError(
        t(
          'Please sign in first to activate a Vakaalat Direct plan.',
          'Plan lene ke liye pehle Sign In karein.',
          'वकालत डायरेक्ट प्लान शुरू करने के लिए कृपया पहले साइन इन करें।'
        )
      );
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const order = await apiFetch<{ orderId: string; razorpayDemoOrderId: string }>(
        '/subscriptions/demo-order',
        { method: 'POST', body: JSON.stringify({ planId: selectedPlan }) },
        token
      );
      await apiFetch(
        '/subscriptions/demo-verify',
        { method: 'POST', body: JSON.stringify({ orderId: order.orderId }) },
        token
      );
      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Demo checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="xp-window w-full max-w-lg shadow-2xl">
        <div className="xp-titlebar">
          <div className="flex items-center gap-2">
            <XpShieldIcon className="h-4 w-4" />
            <span className="text-xs font-bold">
              {t(
                'Vakaalat_Direct_Checkout.exe — Demo Razorpay',
                'Vakaalat_Direct_Checkout.exe — Demo Razorpay',
                'वकालत_डायरेक्ट_चेकआउट.exe — डेमो Razorpay'
              )}
            </span>
          </div>
          <button onClick={onClose} className="xp-win-ctrl xp-win-ctrl-close" aria-label="Close">
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="py-5 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-500" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {t('Direct Reach-Out Unlocked', 'Direct Reach-Out Unlock Ho Gaya', 'सीधा संपर्क अनलॉक हो गया है')}
              </h3>
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                {t(
                  `Demo Razorpay payment succeeded. You can now initiate a private legal understanding with ${attorneyName || 'your chosen advocate'}.`,
                  `Demo Razorpay payment safal raha. Ab aap ${attorneyName || 'advocate'} se privately connect kar sakte hain.`,
                  `डेमो Razorpay भुगतान सफल रहा। अब आप ${attorneyName || 'अपने चुने हुए वकील'} से निजी तौर पर जुड़ सकते हैं।`
                )}
              </p>
              <button onClick={onClose} className="xp-btn xp-btn-primary px-5 py-2 text-xs">
                {t('Continue', 'Aage Badhein', 'आगे बढ़ें')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-accent)]">
                <CreditCard className="h-4 w-4" />
                <span>
                  {t(
                    'Demo Razorpay • Vakaalat Direct Connect',
                    'Demo Razorpay • Vakaalat Direct Connect',
                    'डेमो Razorpay • वकालत डायरेक्ट कनेक्ट'
                  )}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                {attorneyName
                  ? t(
                      `Reach out directly to ${attorneyName}`,
                      `${attorneyName} se seedha sampark karein`,
                      `${attorneyName} से सीधा संपर्क करें`
                    )
                  : t(
                      'Unlock Direct Advocate Reach-Out',
                      'Direct Advocate Connect Unlock Karein',
                      'वकील से सीधा संपर्क अनलॉक करें'
                    )}
              </h3>
              <p className="text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
                {t(
                  'Public guidance in the Court of People is always free. Choose a Vakaalat plan to contact a leaderboard advocate privately.',
                  'Court of People mein public madad hamesha free hai. Private connect ke liye plan chunein.',
                  'जनता की अदालत में सार्वजनिक मार्गदर्शन हमेशा निःशुल्क है। किसी वकील से निजी संपर्क के लिए प्लान चुनें।'
                )}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('vakaalat-direct-monthly')}
                  className={`xp-panel p-3.5 text-left transition ${
                    selectedPlan === 'vakaalat-direct-monthly'
                      ? 'border-2 border-[#2b6be0] ring-2 ring-[#2b6be0]/20'
                      : ''
                  }`}
                >
                  <div className="text-xs font-bold text-[var(--text-accent)]">
                    {t('Direct Monthly', 'Direct Monthly', 'मासिक प्लान')}
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">₹499</div>
                  <div className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">
                    {t('1-on-1 private bridge + alias lock', '1-on-1 private bridge + alias lock', '1-ऑन-1 निजी संवाद + गुप्त पहचान सुरक्षा')}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('vakaalat-shield-quarterly')}
                  className={`xp-panel p-3.5 text-left transition ${
                    selectedPlan === 'vakaalat-shield-quarterly'
                      ? 'border-2 border-[#2b6be0] ring-2 ring-[#2b6be0]/20'
                      : ''
                  }`}
                >
                  <div className="text-xs font-bold text-[var(--text-accent)]">
                    {t('Backroom Shield (3M)', 'Backroom Shield (3M)', 'बैकरूम शील्ड (3 महीने)')}
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-[var(--text-primary)]">₹1,199</div>
                  <div className="mt-1 text-[11px] font-medium text-[var(--text-secondary)]">
                    {t('Up to 5 advocates + priority desk', 'Up to 5 advocates + priority desk', '5 वकीलों से संपर्क + प्राथमिकता डेस्क')}
                  </div>
                </button>
              </div>

              {error && <p className="text-xs font-bold text-red-500">{error}</p>}

              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t('Demo Razorpay Test Mode', 'Demo Razorpay Test Mode', 'डेमो Razorpay टेस्ट मोड')}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePayDemo}
                  disabled={processing}
                  className="xp-btn xp-btn-start px-5 py-2 text-xs disabled:opacity-60"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>
                    {processing
                      ? t('Processing...', 'Processing...', 'प्रक्रिया जारी है...')
                      : t('Pay via Demo Razorpay', 'Demo Razorpay Se Pay Karein', 'डेमो Razorpay से भुगतान करें')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

export const subscriptionsRouter = Router();

const PLANS = [
  {
    id: 'vakaalat-direct-monthly',
    name: 'Vakaalat Direct Connect (Monthly)',
    amountInr: 499,
    features: [
      'Direct private message to any Leaderboard Attorney',
      'Priority First-Aid document checklist review',
      'Full identity & alias protection until mutual legal understanding',
    ],
  },
  {
    id: 'vakaalat-shield-quarterly',
    name: 'Vakaalat Backroom Shield (Quarterly)',
    amountInr: 1199,
    features: [
      'Reach out directly to up to 5 verified advocates',
      'Unlimited Jolly Gemini case-drafting & masking',
      'Priority response badge in Court of People',
    ],
  },
];

subscriptionsRouter.get('/plans', (_req, res) => {
  res.json({ plans: PLANS });
});

subscriptionsRouter.post('/demo-order', requireAuth, (req, res) => {
  const planId = req.body?.planId || 'vakaalat-direct-monthly';
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0];

  const orderId = randomUUID();
  const razorpayDemoOrderId = `order_demo_${Date.now()}`;

  db.prepare(
    `INSERT INTO subscription_orders (id, user_id, plan_name, amount_inr, razorpay_demo_order_id, status)
     VALUES (?, ?, ?, ?, ?, 'created')`
  ).run(orderId, req.user!.id, plan.name, plan.amountInr, razorpayDemoOrderId);

  res.status(201).json({
    orderId,
    razorpayDemoOrderId,
    plan,
    currency: 'INR',
  });
});

subscriptionsRouter.post('/demo-verify', requireAuth, (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) {
    res.status(400).json({ error: 'orderId is required' });
    return;
  }

  const tx = db.transaction(() => {
    db.prepare(`UPDATE subscription_orders SET status = 'paid' WHERE id = ? AND user_id = ?`).run(
      orderId,
      req.user!.id
    );
    db.prepare(`UPDATE users SET has_subscription = 1 WHERE id = ?`).run(req.user!.id);
  });
  tx();

  res.json({ ok: true, hasSubscription: true, message: 'Demo Razorpay payment verified! Direct attorney reach-out unlocked.' });
});

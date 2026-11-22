import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../db/database.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { generateStageName } from '../services/privacyMasker.js';

export const authRouter = Router();

const clientRegisterSchema = z.object({
  realName: z.string().min(2, 'Full name is required'),
  alias: z.string().min(2, 'Alias is required').optional(),
  phone: z.string().min(10, 'Valid 10-digit phone number is required').optional(),
  otp: z.string().length(6, '6-digit OTP is required').optional(),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

authRouter.post('/send-otp', (req, res) => {
  const phone = String(req.body?.phone || '').replace(/\D/g, '');
  if (phone.length < 10) {
    res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
    return;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 10 * 60 * 1000;
  db.prepare(
    `INSERT INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)
     ON CONFLICT(phone) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at`
  ).run(phone, code, expiresAt);

  res.json({
    ok: true,
    phone,
    demoOtp: code,
    message: `Demo OTP sent to ${phone}: ${code}`,
  });
});

const lawyerRegisterSchema = z
  .object({
    realName: z.string().min(2),
    stageName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    college: z.string().min(3),
    experienceYears: z.number().int().min(0).max(60),
    domains: z.array(z.string()).min(1, 'Select at least one legal domain'),
    city: z.string().default('Kanpur'),
    inputMode: z.enum(['typed', 'voice']),
    bioText: z.string(),
    videoCvUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const len = data.bioText.trim().length;
    if (data.inputMode === 'typed' && len < 1700) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bioText'],
        message: `Typed bio must be at least 1,700 characters (currently ${len}). No copy-pasting allowed.`,
      });
    }
    if (data.inputMode === 'voice' && len < 2000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bioText'],
        message: `Voice-recorded bio must be at least 2,000 characters (currently ${len}).`,
      });
    }
  });

authRouter.post('/register/client', (req, res) => {
  const parsed = clientRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(parsed.data.email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const cleanPhone = parsed.data.phone ? parsed.data.phone.replace(/\D/g, '') : null;
  if (cleanPhone && parsed.data.otp) {
    const otpRow = db.prepare('SELECT code, expires_at FROM otp_codes WHERE phone = ?').get(cleanPhone) as any;
    if (!otpRow || otpRow.code !== parsed.data.otp || otpRow.expires_at < Date.now()) {
      res.status(400).json({ error: 'Invalid or expired OTP. Please request a fresh OTP.' });
      return;
    }
    db.prepare('DELETE FROM otp_codes WHERE phone = ?').run(cleanPhone);
  }

  const id = randomUUID();
  const stageName = parsed.data.alias?.trim() || generateStageName(`${parsed.data.realName}-${id}`);
  const passwordHash = bcrypt.hashSync(parsed.data.password, 10);

  db.prepare(
    `INSERT INTO users (id, role, real_name, stage_name, email, phone, password_hash, avatar_url, has_subscription)
     VALUES (?, 'client', ?, ?, ?, ?, ?, NULL, 0)`
  ).run(id, parsed.data.realName, stageName, parsed.data.email, cleanPhone, passwordHash);

  const token = signToken({ id, role: 'client', stageName, email: parsed.data.email });
  res.status(201).json({
    token,
    user: { id, role: 'client', stageName, realName: parsed.data.realName, email: parsed.data.email, avatarUrl: null, hasSubscription: false },
  });
});

authRouter.post('/register/lawyer', (req, res) => {
  const parsed = lawyerRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid lawyer registration details' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(parsed.data.email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const id = randomUUID();
  const passwordHash = bcrypt.hashSync(parsed.data.password, 10);
  const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(parsed.data.stageName)}&backgroundColor=e7e2d8`;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO users (id, role, real_name, stage_name, email, password_hash, avatar_url, has_subscription)
       VALUES (?, 'lawyer', ?, ?, ?, ?, ?, 1)`
    ).run(id, parsed.data.realName, parsed.data.stageName, parsed.data.email, passwordHash, avatarUrl);

    db.prepare(
      `INSERT INTO lawyer_profiles (user_id, bio_text, input_mode, college, experience_years, domains, city, video_cv_url, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(
      id,
      parsed.data.bioText.trim(),
      parsed.data.inputMode,
      parsed.data.college,
      parsed.data.experienceYears,
      JSON.stringify(parsed.data.domains),
      parsed.data.city,
      parsed.data.videoCvUrl || null
    );
  });

  tx();

  const token = signToken({ id, role: 'lawyer', stageName: parsed.data.stageName, email: parsed.data.email });
  res.status(201).json({
    token,
    user: {
      id,
      role: 'lawyer',
      stageName: parsed.data.stageName,
      realName: parsed.data.realName,
      email: parsed.data.email,
      avatarUrl,
      hasSubscription: true,
    },
  });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({
    id: user.id,
    role: user.role,
    stageName: user.stage_name,
    email: user.email,
  });

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      stageName: user.stage_name,
      realName: user.real_name,
      email: user.email,
      avatarUrl: user.avatar_url,
      hasSubscription: Boolean(user.has_subscription),
    },
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, role, real_name, stage_name, email, avatar_url, has_subscription FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    user: {
      id: user.id,
      role: user.role,
      stageName: user.stage_name,
      realName: user.real_name,
      email: user.email,
      avatarUrl: user.avatar_url,
      hasSubscription: Boolean(user.has_subscription),
    },
  });
});

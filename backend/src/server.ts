import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { db } from './db/database.js';
import { seedIfEmpty } from './db/seed.js';
import { authRouter } from './routes/auth.js';
import { jollyRouter } from './routes/jolly.js';
import { lawyersRouter } from './routes/lawyers.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { threadsRouter } from './routes/threads.js';

seedIfEmpty();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'vakaalat-api', timestamp: new Date().toISOString() });
});

app.get('/api/v1/stats', (_req, res) => {
  const clients = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'client'`).get() as any).c;
  const lawyers = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'lawyer'`).get() as any).c;
  const threads = (db.prepare(`SELECT COUNT(*) as c FROM threads`).get() as any).c;
  const comments = (db.prepare(`SELECT COUNT(*) as c FROM comments`).get() as any).c;
  res.json({ clients, lawyers, threads, comments });
});

app.post('/api/v1/feedback', async (req, res) => {
  const { email, message } = req.body || {};
  if (!message || String(message).trim().length < 4) {
    res.status(400).json({ error: 'Please write a short suggestion before submitting.' });
    return;
  }
  const cleanEmail = email ? String(email).trim() : null;
  const cleanMessage = String(message).trim();

  db.prepare('INSERT INTO suggestions (id, email, message) VALUES (?, ?, ?)').run(
    randomUUID(),
    cleanEmail,
    cleanMessage
  );

  // Forward suggestion to funnycoder241@gmail.com via FormSubmit AJAX relay (non-blocking)
  try {
    await fetch('https://formsubmit.co/ajax/funnycoder241@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: 'New Vakaalat Suggestion (Help Us Help You)',
        from_email: cleanEmail || 'anonymous@vakaalat.in',
        message: cleanMessage,
      }),
    });
  } catch {
    // Saved safely in SQLite even if offline
  }

  res.status(201).json({
    ok: true,
    recipient: 'funnycoder241@gmail.com',
    message: 'Thank you! Your suggestion has been sent to funnycoder241@gmail.com.',
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/threads', threadsRouter);
app.use('/api/v1/lawyers', lawyersRouter);
app.use('/api/v1/jolly', jollyRouter);
app.use('/api/v1/subscriptions', subscriptionsRouter);

// Serve built React frontend in production (single-service deployment ready)
const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Vakaalat API] Running on http://localhost:${PORT}`);
});

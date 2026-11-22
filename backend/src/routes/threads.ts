import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { maskSensitiveDetails } from '../services/privacyMasker.js';

export const threadsRouter = Router();

const createThreadSchema = z.object({
  category: z.string().min(2),
  title: z.string().min(5).max(200),
  rawContent: z.string().min(15, 'Please describe what happened in at least 15 characters'),
});

const createCommentSchema = z.object({
  content: z.string().min(5, 'Comment must be at least 5 characters'),
});

threadsRouter.get('/', optionalAuth, (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : 'All';
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  let sql = `
    SELECT t.id, t.category, t.title, t.masked_content, t.celebrity_alias_map, t.upvotes, t.created_at,
           u.stage_name AS author_stage_name, u.role AS author_role
    FROM threads t
    JOIN users u ON u.id = t.author_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category && category !== 'All') {
    sql += ' AND t.category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (t.title LIKE ? OR t.masked_content LIKE ? OR t.category LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY t.created_at DESC, t.upvotes DESC';

  const threads = db.prepare(sql).all(...params) as any[];

  const commentsStmt = db.prepare(`
    SELECT c.id, c.thread_id, c.content, c.likes_count, c.importance_score, c.created_at,
           u.id AS author_id, u.stage_name AS author_stage_name, u.role AS author_role, u.avatar_url AS author_avatar
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.thread_id = ?
    ORDER BY c.importance_score DESC, c.likes_count DESC, c.created_at ASC
  `);

  const enriched = threads.map((t) => ({
    id: t.id,
    category: t.category,
    title: t.title,
    maskedContent: t.masked_content,
    aliases: JSON.parse(t.celebrity_alias_map || '{}'),
    upvotes: t.upvotes,
    createdAt: t.created_at,
    authorStageName: t.author_stage_name,
    authorRole: t.author_role,
    comments: (commentsStmt.all(t.id) as any[]).map((c) => ({
      id: c.id,
      threadId: c.thread_id,
      content: c.content,
      likesCount: c.likes_count,
      importanceScore: c.importance_score,
      createdAt: c.created_at,
      authorId: c.author_id,
      authorStageName: c.author_stage_name,
      authorRole: c.author_role,
      authorAvatar: c.author_role === 'lawyer' ? c.author_avatar : null,
    })),
  }));

  res.json({ threads: enriched });
});

threadsRouter.get('/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, category, title, raw_content, masked_content, celebrity_alias_map, upvotes, created_at
       FROM threads WHERE author_id = ? ORDER BY created_at DESC`
    )
    .all(req.user!.id) as any[];

  const commentsStmt = db.prepare(`
    SELECT c.id, c.content, c.likes_count, c.created_at,
           u.stage_name AS author_stage_name, u.role AS author_role
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.thread_id = ?
    ORDER BY c.importance_score DESC, c.likes_count DESC
  `);

  res.json({
    threads: rows.map((r) => {
      const comments = (commentsStmt.all(r.id) as any[]).map((c) => ({
        id: c.id,
        content: c.content,
        likesCount: c.likes_count,
        createdAt: c.created_at,
        authorStageName: c.author_stage_name,
        authorRole: c.author_role,
      }));
      return {
        id: r.id,
        category: r.category,
        title: r.title,
        rawContent: r.raw_content,
        maskedContent: r.masked_content,
        aliases: JSON.parse(r.celebrity_alias_map || '{}'),
        upvotes: r.upvotes,
        createdAt: r.created_at,
        comments,
      };
    }),
  });
});

threadsRouter.post('/', requireAuth, (req, res) => {
  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid post data' });
    return;
  }

  const user = db.prepare('SELECT real_name, stage_name FROM users WHERE id = ?').get(req.user!.id) as any;
  const { maskedContent, aliases, sensitiveAmounts } = maskSensitiveDetails(
    parsed.data.rawContent,
    user?.real_name
  );

  const id = randomUUID();
  db.prepare(
    `INSERT INTO threads (id, author_id, category, title, raw_content, masked_content, celebrity_alias_map, sensitive_amounts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.id,
    parsed.data.category,
    parsed.data.title,
    parsed.data.rawContent,
    maskedContent,
    JSON.stringify(aliases),
    JSON.stringify(sensitiveAmounts)
  );

  res.status(201).json({
    thread: {
      id,
      category: parsed.data.category,
      title: parsed.data.title,
      rawContent: parsed.data.rawContent,
      maskedContent,
      aliases,
      upvotes: 0,
      authorStageName: user?.stage_name || req.user!.stageName,
    },
  });
});

threadsRouter.post('/:id/comments', requireAuth, (req, res) => {
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid comment' });
    return;
  }

  const thread = db.prepare('SELECT id FROM threads WHERE id = ?').get(req.params.id);
  if (!thread) {
    res.status(404).json({ error: 'Thread not found' });
    return;
  }

  const id = randomUUID();
  const baseImportance = req.user!.role === 'lawyer' ? 5 : 1;

  db.prepare(
    `INSERT INTO comments (id, thread_id, author_id, content, likes_count, importance_score)
     VALUES (?, ?, ?, ?, 0, ?)`
  ).run(id, req.params.id, req.user!.id, parsed.data.content, baseImportance);

  res.status(201).json({
    comment: {
      id,
      threadId: req.params.id,
      content: parsed.data.content,
      likesCount: 0,
      authorId: req.user!.id,
      authorStageName: req.user!.stageName,
      authorRole: req.user!.role,
    },
  });
});

threadsRouter.post('/comments/:commentId/like', requireAuth, (req, res) => {
  const comment = db
    .prepare(
      `SELECT c.id, c.author_id, u.role
       FROM comments c JOIN users u ON u.id = c.author_id
       WHERE c.id = ?`
    )
    .get(req.params.commentId) as any;

  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  const existing = db
    .prepare('SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?')
    .get(comment.id, req.user!.id);

  if (existing) {
    res.json({ liked: true, message: 'Already liked' });
    return;
  }

  const tx = db.transaction(() => {
    db.prepare('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)').run(comment.id, req.user!.id);
    const weight = comment.role === 'lawyer' ? 1.5 : 1.0;
    db.prepare('UPDATE comments SET likes_count = likes_count + 1, importance_score = importance_score + ? WHERE id = ?').run(
      weight,
      comment.id
    );
    if (comment.role === 'lawyer') {
      db.prepare('UPDATE lawyer_profiles SET total_likes = total_likes + 1 WHERE user_id = ?').run(comment.author_id);
    }
  });

  tx();
  res.json({ liked: true });
});

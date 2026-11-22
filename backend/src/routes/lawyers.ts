import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const lawyersRouter = Router();

lawyersRouter.get('/leaderboard', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.stage_name, u.avatar_url,
              lp.college, lp.experience_years, lp.domains, lp.city,
              lp.verification_status, lp.profile_views, lp.total_likes, lp.bio_text
       FROM users u
       JOIN lawyer_profiles lp ON lp.user_id = u.id
       WHERE u.role = 'lawyer'
       ORDER BY lp.total_likes DESC, lp.profile_views DESC`
    )
    .all() as any[];

  res.json({
    lawyers: rows.map((r, index) => ({
      rank: index + 1,
      id: r.id,
      stageName: r.stage_name,
      avatarUrl: r.avatar_url,
      college: r.college,
      experienceYears: r.experience_years,
      domains: JSON.parse(r.domains || '[]'),
      city: r.city,
      verificationStatus: r.verification_status,
      profileViews: r.profile_views,
      totalLikes: r.total_likes,
      bioExcerpt: r.bio_text.slice(0, 240) + '...',
      bioText: r.bio_text,
    })),
  });
});

lawyersRouter.get('/dashboard', requireAuth, requireRole('lawyer'), (req, res) => {
  const profile = db
    .prepare(
      `SELECT u.id, u.stage_name, u.real_name, u.avatar_url,
              lp.college, lp.experience_years, lp.domains, lp.city,
              lp.verification_status, lp.profile_views, lp.total_likes, lp.bio_text, lp.video_cv_url
       FROM users u
       JOIN lawyer_profiles lp ON lp.user_id = u.id
       WHERE u.id = ?`
    )
    .get(req.user!.id) as any;

  if (!profile) {
    res.status(404).json({ error: 'Lawyer profile not found' });
    return;
  }

  const domains: string[] = JSON.parse(profile.domains || '[]');
  const allThreads = db
    .prepare(
      `SELECT t.id, t.category, t.title, t.masked_content, t.upvotes, t.created_at, u.stage_name AS author_stage_name
       FROM threads t JOIN users u ON u.id = t.author_id
       ORDER BY t.created_at DESC`
    )
    .all() as any[];

  const possibleClients = allThreads
    .filter((t) => domains.includes(t.category))
    .map((t) => ({
      id: t.id,
      category: t.category,
      title: t.title,
      maskedContent: t.masked_content,
      upvotes: t.upvotes,
      createdAt: t.created_at,
      authorStageName: t.author_stage_name,
    }));

  const mostTimeSpentVisitors = db
    .prepare(
      `SELECT id, visitor_stage_name, visitor_domain_interest, seconds_spent, visited_at
       FROM profile_visit_logs
       WHERE lawyer_id = ?
       ORDER BY seconds_spent DESC
       LIMIT 10`
    )
    .all(req.user!.id) as any[];

  res.json({
    profile: {
      id: profile.id,
      stageName: profile.stage_name,
      realName: profile.real_name,
      avatarUrl: profile.avatar_url,
      college: profile.college,
      experienceYears: profile.experience_years,
      domains,
      city: profile.city,
      verificationStatus: profile.verification_status,
      profileViews: profile.profile_views,
      totalLikes: profile.total_likes,
      bioLength: profile.bio_text.length,
      videoCvUrl: profile.video_cv_url,
    },
    possibleClients,
    mostTimeSpentVisitors: mostTimeSpentVisitors.map((v) => ({
      id: v.id,
      visitorStageName: v.visitor_stage_name,
      domainInterest: v.visitor_domain_interest,
      secondsSpent: v.seconds_spent,
      visitedAt: v.visited_at,
    })),
  });
});

lawyersRouter.post('/:id/view', (req, res) => {
  const result = db
    .prepare('UPDATE lawyer_profiles SET profile_views = profile_views + 1 WHERE user_id = ?')
    .run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Lawyer not found' });
    return;
  }
  res.json({ ok: true });
});

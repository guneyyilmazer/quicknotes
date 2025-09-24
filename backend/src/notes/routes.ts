import { Router } from 'express';
import { requireAuth, AuthedRequest } from '../auth/middleware';
import { query } from '../db/pool';
import { SQL } from './sql';
import { ensureRedis, redis, invalidateUserSearchCache } from '../cache/redis';

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.post('/', async (req: AuthedRequest, res) => {
  const { title, content, tags } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const userId = req.user!.userId;
  const tagArray = Array.isArray(tags) ? tags : [];
  const created = await query(SQL.create, [userId, title, content || '', tagArray]);
  await invalidateUserSearchCache(userId);
  return res.status(201).json(created.rows[0]);
});

notesRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const rows = await query(SQL.listByUser, [userId]);
  return res.json(rows.rows);
});

notesRouter.get('/:id', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  const row = await query(SQL.getById, [id, userId]);
  if (row.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  return res.json(row.rows[0]);
});

notesRouter.put('/:id', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  const { title, content, tags } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title is required' });
  const tagArray = Array.isArray(tags) ? tags : [];
  const updated = await query(SQL.update, [id, userId, title, content || '', tagArray]);
  if (updated.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  await invalidateUserSearchCache(userId);
  return res.json(updated.rows[0]);
});

notesRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const id = Number(req.params.id);
  const removed = await query(SQL.remove, [id, userId]);
  if (removed.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  await invalidateUserSearchCache(userId);
  return res.status(204).send();
});

notesRouter.get('/search/by-tags', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const raw = String(req.query.tags || '').trim();
  if (!raw) return res.json([]);
  const tags = raw.split(',').map((t) => t.trim()).filter(Boolean);
  const cacheKey = `notes:search:${userId}:${tags.sort().join('|')}`;

  await ensureRedis();
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const result = await query(SQL.searchByTags, [userId, tags]);
  await redis.set(cacheKey, JSON.stringify(result.rows), { EX: 300 });
  return res.json(result.rows);
}); 
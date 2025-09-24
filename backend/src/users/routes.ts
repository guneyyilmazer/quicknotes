import { Router } from 'express';
import { query } from '../db/pool';
import { SQL } from './sql';
import { hashPassword, verifyPassword } from '../auth/hash';
import { signToken } from '../auth/jwt';
import { requireAuth, AuthedRequest } from '../auth/middleware';

export const usersRouter = Router();

usersRouter.post('/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const existing = await query<{ id: number }>(SQL.findByEmail, [email]);
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await hashPassword(password);
  const created = await query<{ id: number; email: string }>(SQL.createUser, [email, passwordHash]);
  if (created.rows.length === 0) return res.status(500).json({ error: 'Failed to create user' });
  const createdUser = created.rows[0]!;
  const token = signToken({ userId: createdUser.id, email: createdUser.email });
  return res.status(201).json({ token, user: { id: createdUser.id, email: createdUser.email } });
});

usersRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const found = await query<{ id: number; email: string; password_hash: string }>(SQL.findByEmail, [email]);
  if (found.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const foundUser = found.rows[0]!;
  const ok = await verifyPassword(password, foundUser.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ userId: foundUser.id, email: foundUser.email });
  return res.json({ token, user: { id: foundUser.id, email: foundUser.email } });
});

usersRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const authed = req.user;
  if (!authed) return res.status(401).json({ error: 'Unauthorized' });
  const found = await query<{ id: number; email: string }>(SQL.findById, [authed.userId]);
  if (found.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const u = found.rows[0]!;
  return res.json({ id: u.id, email: u.email });
}); 
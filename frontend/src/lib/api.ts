import axios from 'axios';
import { saveToken, clearToken, loadToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_BASE,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Initialize auth header from stored token on load
const existingToken = loadToken();
if (existingToken) setAuthToken(existingToken);

// Types
export type Note = {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

// Auth
export async function authLogin(email: string, password: string): Promise<string> {
  const res = await api.post<{ token: string; user: { id: number; email: string } }>(`/auth/login`, { email, password });
  const token = res.data.token;
  saveToken(token);
  setAuthToken(token);
  return token;
}

export async function authRegister(email: string, password: string): Promise<string> {
  const res = await api.post<{ token: string; user: { id: number; email: string } }>(`/auth/register`, { email, password });
  const token = res.data.token;
  saveToken(token);
  setAuthToken(token);
  return token;
}

export function authLogout() {
  clearToken();
  setAuthToken(null);
}

// Notes
export async function listNotes(): Promise<Note[]> {
  const res = await api.get<Note[]>(`/notes`);
  return res.data;
}

export async function createNoteApi(payload: { title: string; content: string; tags: string[] }): Promise<Note> {
  const res = await api.post<Note>(`/notes`, payload);
  return res.data;
}

export async function deleteNoteById(id: number): Promise<void> {
  await api.delete(`/notes/${id}`);
}

export async function searchNotesByTags(tagsCsv: string): Promise<Note[]> {
  const res = await api.get<Note[]>(`/notes/search/by-tags`, { params: { tags: tagsCsv } });
  return res.data;
} 
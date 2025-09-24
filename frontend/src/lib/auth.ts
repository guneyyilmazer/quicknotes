const KEY = 'quicknotes_token';

export function saveToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function loadToken(): string | null {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
} 
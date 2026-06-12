import { HttpHeaders } from '@angular/common/http';
import { User } from './types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function saveAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch (error) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getStoredUserId(fallback = 1): number {
  return getStoredUser()?.id ?? fallback;
}

export function createAuthHeaders(): HttpHeaders {
  const token = getAuthToken();
  return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
}

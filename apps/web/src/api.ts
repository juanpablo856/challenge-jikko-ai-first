import type {
  Bookmark,
  CreateBookmarkRequest,
  CreateSearchRequest,
  LoginResponse,
  Page,
  Profile,
  SavedSearch,
  TenderDetail,
  TenderFilters,
  TenderSummary,
} from '@portal/contracts';

const TOKEN_KEY = 'portal.token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Called on any 401 so the app can redirect to login. Set by the auth provider.
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined) headers['content-type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    onUnauthorized();
    throw new Error('sesión expirada');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'error' }));
    throw new Error(err.message ?? `error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function toQuery(f: TenderFilters): string {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) p.set(k, String(v));
  });
  return p.toString();
}

export const api = {
  register: (email: string, password: string) =>
    request<{ id: number; email: string }>('POST', '/auth/register', { email, password }),
  login: (email: string, password: string) =>
    request<LoginResponse>('POST', '/auth/login', { email, password }),
  me: () => request<Profile>('GET', '/auth/me'),

  searchTenders: (f: TenderFilters) =>
    request<Page<TenderSummary>>('GET', `/tenders?${toQuery(f)}`),
  tenderDetail: (uid: string) => request<TenderDetail>('GET', `/tenders/${encodeURIComponent(uid)}`),

  listBookmarks: () => request<Bookmark[]>('GET', '/bookmarks'),
  addBookmark: (b: CreateBookmarkRequest) => request<Bookmark>('POST', '/bookmarks', b),
  removeBookmark: (id: number) => request<void>('DELETE', `/bookmarks/${id}`),

  listSearches: () => request<SavedSearch[]>('GET', '/searches'),
  saveSearch: (s: CreateSearchRequest) => request<SavedSearch>('POST', '/searches', s),
  searchResults: (id: number) => request<Page<TenderSummary>>('GET', `/searches/${id}/results`),
  removeSearch: (id: number) => request<void>('DELETE', `/searches/${id}`),
};

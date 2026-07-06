// Shared contract between apps/api and apps/web.
// Domain/DB terms stay in Spanish; code identifiers in English.

// ---- Auth ----
export interface RegisterRequest {
  email: string;
  password: string;
}
export interface RegisterResponse {
  id: number;
  email: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
  expiresIn: number; // seconds
}
export interface Profile {
  id: number;
  email: string;
  created_at: string;
}

// ---- Normalized tender filter model (D5) ----
export type TenderOrder =
  | 'fecha_desc'
  | 'fecha_asc'
  | 'valor_desc'
  | 'valor_asc';

export interface TenderFilters {
  q?: string;
  entidad?: string;
  departamento?: string;
  modalidad?: string;
  valorMin?: number;
  valorMax?: number;
  fechaDesde?: string; // ISO date (YYYY-MM-DD)
  fechaHasta?: string;
  estado?: string;
  orden?: TenderOrder;
  page?: number; // 1-based
  pageSize?: number;
}

// ---- Tender shapes ----
export interface TenderSummary {
  noticeUid: string;
  titulo: string | null;
  entidad: string | null;
  valor: number | null;
  fecha: string | null;
  estado: string | null;
}

export interface CromaEnrichment {
  contratosAdjudicados?: unknown[];
  metricasEjecucion?: Record<string, unknown>;
  capped?: boolean;
}

export interface TenderDetail extends TenderSummary {
  departamento: string | null;
  modalidad: string | null;
  descripcion: string | null;
  raw?: Record<string, unknown>;
  enriquecimiento?: CromaEnrichment | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  stale?: boolean; // served from cache after upstream failure
}

// ---- Bookmarks ----
export interface CreateBookmarkRequest {
  noticeUid: string;
  note?: string;
}
export interface Bookmark {
  id: number;
  noticeUid: string;
  snapshot: TenderSummary;
  note: string | null;
  created_at: string;
  liveUnavailable?: boolean; // snapshot shown because source no longer has it
}

// ---- Saved searches ----
export interface CreateSearchRequest {
  nombre: string;
  criteria: TenderFilters;
}
export interface SavedSearch {
  id: number;
  nombre: string;
  criteria: TenderFilters;
  created_at: string;
}

// ---- Errors ----
export interface ApiError {
  error: string;
  message: string;
  fields?: Record<string, string>;
}

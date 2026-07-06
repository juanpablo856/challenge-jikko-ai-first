import type { TenderFilters, TenderOrder } from '@portal/contracts';
import { badRequest } from '../errors.js';

// Page-size bounds live here (server-authoritative). Kept out of @portal/contracts so
// that package stays type-only and the compiled API has no runtime dep on it.
export const PAGE_SIZE_MAX = 50;
export const PAGE_SIZE_DEFAULT = 20;

const ORDERS: TenderOrder[] = ['fecha_desc', 'fecha_asc', 'valor_desc', 'valor_asc'];
const STRING_FIELDS = ['q', 'entidad', 'departamento', 'modalidad', 'estado'] as const;
const ALLOWED_KEYS = new Set<string>([
  ...STRING_FIELDS,
  'valorMin',
  'valorMax',
  'fechaDesde',
  'fechaHasta',
  'orden',
  'page',
  'pageSize',
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Validate + coerce an untrusted object into the normalized filter model.
// Throws AppError(400) with per-field messages. Used by GET /tenders (query) and
// POST /searches (criteria) so both share exactly one validation path.
export function normalizeFilters(raw: Record<string, unknown>): TenderFilters {
  const fields: Record<string, string> = {};
  const out: TenderFilters = {};

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_KEYS.has(key)) fields[key] = 'campo desconocido';
  }

  for (const f of STRING_FIELDS) {
    const v = raw[f];
    if (v === undefined || v === '') continue;
    if (typeof v !== 'string' || v.length > 200) fields[f] = 'texto inválido';
    else out[f] = v.trim();
  }

  const num = (key: 'valorMin' | 'valorMax') => {
    const v = raw[key];
    if (v === undefined || v === '') return;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) fields[key] = 'número inválido';
    else out[key] = n;
  };
  num('valorMin');
  num('valorMax');
  if (out.valorMin !== undefined && out.valorMax !== undefined && out.valorMin > out.valorMax) {
    fields.valorMin = 'valorMin no puede ser mayor que valorMax';
  }

  const date = (key: 'fechaDesde' | 'fechaHasta') => {
    const v = raw[key];
    if (v === undefined || v === '') return;
    if (typeof v !== 'string' || !DATE_RE.test(v)) fields[key] = 'fecha inválida (YYYY-MM-DD)';
    else out[key] = v;
  };
  date('fechaDesde');
  date('fechaHasta');

  if (raw.orden !== undefined && raw.orden !== '') {
    if (!ORDERS.includes(raw.orden as TenderOrder)) fields.orden = 'orden inválido';
    else out.orden = raw.orden as TenderOrder;
  }

  out.page = intInRange(raw.page, 1, 1, Number.MAX_SAFE_INTEGER, 'page', fields);
  out.pageSize = intInRange(raw.pageSize, PAGE_SIZE_DEFAULT, 1, PAGE_SIZE_MAX, 'pageSize', fields);

  if (Object.keys(fields).length > 0) throw badRequest('parámetros inválidos', fields);
  return out;
}

function intInRange(
  v: unknown,
  dflt: number,
  min: number,
  max: number,
  key: string,
  fields: Record<string, string>,
): number {
  if (v === undefined || v === '') return dflt;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) {
    fields[key] = `debe ser entero entre ${min} y ${max}`;
    return dflt;
  }
  return n;
}

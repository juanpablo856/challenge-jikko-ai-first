import type { Page, TenderDetail, TenderFilters, TenderSummary } from '@portal/contracts';
import type { TenderSource } from './port.js';
import { PAGE_SIZE_DEFAULT } from './filters.js';

// SECOP I column mapping. ponytail: centralized here so a dataset/schema change is a
// one-object edit and the rest of the system keeps using the normalized model (D5, risk
// mitigation). Verify these against the real SODA dataset before production — this is the
// design's open question (exact resource id + columns).
// Verified against SECOP II "Procesos de Contratación" (dataset p6dx-8zbt) on datos.gov.co.
const COL = {
  id: 'id_del_proceso',
  titulo: 'nombre_del_procedimiento',
  entidad: 'entidad',
  valor: 'precio_base',
  fecha: 'fecha_de_publicacion_del',
  estado: 'estado_del_procedimiento',
  departamento: 'departamento_entidad',
  modalidad: 'modalidad_de_contratacion',
  descripcion: 'descripci_n_del_procedimiento',
} as const;

const ORDER_SQL: Record<NonNullable<TenderFilters['orden']>, string> = {
  fecha_desc: `${COL.fecha} DESC`,
  fecha_asc: `${COL.fecha} ASC`,
  valor_desc: `${COL.valor} DESC`,
  valor_asc: `${COL.valor} ASC`,
};

// SoQL string literal escaping: single quotes are doubled. Column names are never
// user-derived (constants above), so the only injection surface is string values.
const sq = (v: string) => `'${v.replace(/'/g, "''")}'`;

export interface SodaOptions {
  dataset: string;
  appToken?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class SodaTenderSource implements TenderSource {
  private base: string;
  private timeoutMs: number;
  constructor(private opts: SodaOptions) {
    this.base = opts.baseUrl ?? 'https://www.datos.gov.co/resource';
    this.timeoutMs = opts.timeoutMs ?? 8000;
  }

  private buildWhere(f: TenderFilters): string {
    const c: string[] = [];
    if (f.entidad) c.push(`upper(${COL.entidad}) like upper('%${f.entidad.replace(/'/g, "''")}%')`);
    if (f.departamento) c.push(`${COL.departamento} = ${sq(f.departamento)}`);
    if (f.modalidad) c.push(`${COL.modalidad} = ${sq(f.modalidad)}`);
    if (f.estado) c.push(`${COL.estado} = ${sq(f.estado)}`);
    if (f.valorMin !== undefined) c.push(`${COL.valor} >= ${f.valorMin}`);
    if (f.valorMax !== undefined) c.push(`${COL.valor} <= ${f.valorMax}`);
    if (f.fechaDesde) c.push(`${COL.fecha} >= ${sq(f.fechaDesde)}`);
    if (f.fechaHasta) c.push(`${COL.fecha} <= ${sq(f.fechaHasta)}`);
    return c.join(' AND ');
  }

  private async fetchRows(params: URLSearchParams): Promise<Record<string, unknown>[]> {
    if (this.opts.appToken) params.set('$$app_token', this.opts.appToken);
    const url = `${this.base}/${this.opts.dataset}.json?${params.toString()}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) });
    if (!res.ok) throw new Error(`SODA responded ${res.status}`);
    return (await res.json()) as Record<string, unknown>[];
  }

  async search(f: TenderFilters): Promise<Page<TenderSummary>> {
    const page = f.page ?? 1;
    const pageSize = f.pageSize ?? PAGE_SIZE_DEFAULT;
    const params = new URLSearchParams();
    if (f.q) params.set('$q', f.q);
    const where = this.buildWhere(f);
    if (where) params.set('$where', where);
    params.set('$order', ORDER_SQL[f.orden ?? 'fecha_desc']);
    // Fetch one extra to compute hasMore without a count query.
    params.set('$limit', String(pageSize + 1));
    params.set('$offset', String((page - 1) * pageSize));

    const rows = await this.fetchRows(params);
    const hasMore = rows.length > pageSize;
    const items = rows.slice(0, pageSize).map((r) => this.toSummary(r));
    return { items, page, pageSize, hasMore };
  }

  async getByNoticeUid(uid: string): Promise<TenderDetail | null> {
    const params = new URLSearchParams();
    params.set('$where', `${COL.id} = ${sq(uid)}`);
    params.set('$limit', '1');
    const rows = await this.fetchRows(params);
    if (rows.length === 0) return null;
    return this.toDetail(rows[0]);
  }

  private str(row: Record<string, unknown>, key: string): string | null {
    const v = row[key];
    return v === undefined || v === null ? null : String(v);
  }

  private toSummary(row: Record<string, unknown>): TenderSummary {
    const valor = row[COL.valor];
    return {
      noticeUid: this.str(row, COL.id) ?? '',
      titulo: this.str(row, COL.titulo),
      entidad: this.str(row, COL.entidad),
      valor: valor === undefined || valor === null ? null : Number(valor),
      fecha: this.str(row, COL.fecha),
      estado: this.str(row, COL.estado),
    };
  }

  private toDetail(row: Record<string, unknown>): TenderDetail {
    return {
      ...this.toSummary(row),
      departamento: this.str(row, COL.departamento),
      modalidad: this.str(row, COL.modalidad),
      descripcion: this.str(row, COL.descripcion),
      raw: row,
      enriquecimiento: null,
    };
  }
}

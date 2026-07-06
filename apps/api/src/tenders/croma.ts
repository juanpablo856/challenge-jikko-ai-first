import type { TenderDetail } from '@portal/contracts';
import type { TenderEnrichment } from './port.js';

const NOTICE_RE = /^CO1\.NTC\.\d+$/;
const NULLISH = new Set(['No Definido', 'No Aplica', '']);

// Recursively map SECOP's "No Definido"/"No Aplica" sentinels to null.
function normalize(value: unknown): unknown {
  if (typeof value === 'string') return NULLISH.has(value.trim()) ? null : value;
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)]));
  }
  return value;
}

export interface CromaOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

// Optional detail enrichment. Only activates for CO1.NTC.<n> ids. Any failure or timeout
// returns the base detail unchanged — Croma never breaks the base response (spec).
export class CromaEnrichmentSource implements TenderEnrichment {
  private base: string;
  private timeoutMs: number;
  constructor(private opts: CromaOptions) {
    this.base = opts.baseUrl ?? 'https://api.croma.run/co/secop';
    this.timeoutMs = opts.timeoutMs ?? 5000;
  }

  async enrich(detail: TenderDetail): Promise<TenderDetail> {
    if (!NOTICE_RE.test(detail.noticeUid)) return detail;
    try {
      const res = await fetch(`${this.base}/notice/${encodeURIComponent(detail.noticeUid)}`, {
        headers: { Authorization: `Bearer ${this.opts.apiKey}` },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) return detail;
      const data = normalize(await res.json()) as Record<string, unknown>;
      return {
        ...detail,
        enriquecimiento: {
          contratosAdjudicados: (data.contratos as unknown[]) ?? undefined,
          metricasEjecucion: (data.metricas as Record<string, unknown>) ?? undefined,
          capped: data.capped === true,
        },
      };
    } catch {
      return detail; // degrade silently
    }
  }
}

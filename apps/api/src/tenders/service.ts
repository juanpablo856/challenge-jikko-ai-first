import type { Page, TenderDetail, TenderFilters, TenderSummary } from '@portal/contracts';
import type { TenderEnrichment, TenderSource } from './port.js';
import { TtlCache } from './cache.js';
import { upstreamUnavailable } from '../errors.js';

// Composes the source (SODA) with a short TTL cache, optional enrichment (Croma), and
// stale-on-error degradation (D7). On upstream failure: serve stale cache if present,
// else throw a typed 502.
export class TenderService {
  private searchCache = new TtlCache<Page<TenderSummary>>(60_000);
  private detailCache = new TtlCache<TenderDetail>(300_000);

  constructor(
    private source: TenderSource,
    private enrichment?: TenderEnrichment,
  ) {}

  async search(criteria: TenderFilters): Promise<Page<TenderSummary>> {
    const key = JSON.stringify(criteria);
    const cached = this.searchCache.get(key);
    if (cached?.fresh) return cached.value;
    try {
      const page = await this.source.search(criteria);
      this.searchCache.set(key, page);
      return page;
    } catch (err) {
      if (cached) return { ...cached.value, stale: true };
      throw upstreamUnavailable(`no fue posible consultar la fuente: ${(err as Error).message}`);
    }
  }

  // Returns null when the source has no such tender (=> caller sends 404).
  async getDetail(noticeUid: string): Promise<TenderDetail | null> {
    const cached = this.detailCache.get(noticeUid);
    if (cached?.fresh) return cached.value;
    let base: TenderDetail | null;
    try {
      base = await this.source.getByNoticeUid(noticeUid);
    } catch (err) {
      if (cached) return { ...cached.value, enriquecimiento: cached.value.enriquecimiento };
      throw upstreamUnavailable(`no fue posible consultar la fuente: ${(err as Error).message}`);
    }
    if (!base) return null;
    const detail = this.enrichment ? await this.enrichment.enrich(base) : base;
    this.detailCache.set(noticeUid, detail);
    return detail;
  }

  // Best-effort summary for bookmark snapshots: reuses detail path, no throw on miss.
  async getSummary(noticeUid: string): Promise<TenderSummary | null> {
    const d = await this.getDetail(noticeUid);
    if (!d) return null;
    const { noticeUid: id, titulo, entidad, valor, fecha, estado } = d;
    return { noticeUid: id, titulo, entidad, valor, fecha, estado };
  }
}

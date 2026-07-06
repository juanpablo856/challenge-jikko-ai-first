import type { Page, TenderDetail, TenderFilters, TenderSummary } from '@portal/contracts';

// Domain port (hexagonal, D2). The core depends on this, never on concrete HTTP.
export interface TenderSource {
  search(criteria: TenderFilters): Promise<Page<TenderSummary>>;
  getByNoticeUid(uid: string): Promise<TenderDetail | null>;
}

// Optional detail enrichment (Croma). Failure must never break the base detail.
export interface TenderEnrichment {
  enrich(detail: TenderDetail): Promise<TenderDetail>;
}

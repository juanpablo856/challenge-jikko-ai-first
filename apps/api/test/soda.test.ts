import { afterEach, describe, expect, it, vi } from 'vitest';
import { SodaTenderSource } from '../src/tenders/soda.js';

describe('SodaTenderSource $where escaping', () => {
  afterEach(() => vi.restoreAllMocks());

  it('doubles single quotes in string filters (no raw injection)', async () => {
    let capturedUrl = '';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        capturedUrl = url;
        return { ok: true, json: async () => [] } as Response;
      }),
    );

    const src = new SodaTenderSource({ dataset: 'test' });
    await src.search({ departamento: "Bol'ivar'; DROP" });

    // URLSearchParams encodes spaces as '+'; normalize before asserting.
    const decoded = decodeURIComponent(capturedUrl).replace(/\+/g, ' ');
    // The injected quote must be escaped by doubling, never left to break out of the literal.
    expect(decoded).toContain("= 'Bol''ivar''; DROP'");
    expect(decoded).not.toContain("'Bol'ivar'"); // unescaped form absent
  });
});

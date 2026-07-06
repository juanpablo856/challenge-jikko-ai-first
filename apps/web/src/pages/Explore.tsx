import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Page, TenderFilters, TenderSummary } from '@portal/contracts';
import { api } from '../api';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Status } from '../components/ui/Status';
import { SearchIcon, SaveIcon, BookmarkIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/ui/Icons';

const money = (v: number | null) =>
  v == null ? '—' : v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<TenderFilters>(readFilters(params));
  const [data, setData] = useState<Page<TenderSummary> | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const run = async (f: TenderFilters) => {
    setStatus('loading');
    setError('');
    try {
      setData(await api.searchTenders(f));
      setStatus('idle');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    }
  };

  // Re-run whenever the URL query changes (also drives back/forward + applied saved searches).
  useEffect(() => {
    const f = readFilters(params);
    setFilters(f);
    run(f);
  }, [params]);

  const apply = (next: TenderFilters) => setParams(toParams({ ...next, page: 1 }));
  const goPage = (page: number) => setParams(toParams({ ...filters, page }));

  const bookmark = async (uid: string) => {
    try {
      await api.addBookmark({ noticeUid: uid });
      alert('Convocatoria guardada.');
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const saveSearch = async () => {
    const nombre = prompt('Ponle un nombre a esta búsqueda');
    if (!nombre) return;
    try {
      await api.saveSearch({ nombre, criteria: filters });
      alert('Búsqueda guardada.');
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="page-title">Explorar convocatorias</h1>

      <FilterPanel initial={filters} onApply={apply} onSave={saveSearch} />

      {status === 'loading' && <Status tone="info">Cargando convocatorias…</Status>}
      {status === 'error' && <Status tone="error">No pudimos cargar las convocatorias: {error}</Status>}
      {data?.stale && (
        <Status tone="warning">Mostrando resultados guardados en caché; la fuente oficial no está disponible ahora.</Status>
      )}

      {status === 'idle' && data && data.items.length === 0 && (
        <p className="empty">No encontramos convocatorias con estos filtros. Ajústalos e intenta de nuevo.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="list" aria-label="Resultados de convocatorias">
          {data.items.map((t) => {
            const titulo = t.titulo ?? t.noticeUid;
            return (
              <li key={t.noticeUid} className="card">
                <div>
                  <Link to={`/tenders/${encodeURIComponent(t.noticeUid)}`}>
                    <strong>{titulo}</strong>
                  </Link>
                  <div className="muted">
                    {t.entidad} · {money(t.valor)} · {t.estado ?? '—'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  icon={<BookmarkIcon />}
                  aria-label={`Guardar convocatoria: ${titulo}`}
                  onClick={() => bookmark(t.noticeUid)}
                >
                  Guardar
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.items.length > 0 && (
        <nav className="pager" aria-label="Paginación de resultados">
          <Button
            variant="secondary"
            icon={<ChevronLeftIcon />}
            disabled={(data.page ?? 1) <= 1}
            onClick={() => goPage((data.page ?? 1) - 1)}
          >
            Anterior
          </Button>
          <span aria-current="page">Página {data.page}</span>
          <Button
            variant="secondary"
            disabled={!data.hasMore}
            onClick={() => goPage((data.page ?? 1) + 1)}
          >
            Siguiente
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  );
}

function FilterPanel({
  initial,
  onApply,
  onSave,
}: {
  initial: TenderFilters;
  onApply: (f: TenderFilters) => void;
  onSave: () => void;
}) {
  const [f, setF] = useState<TenderFilters>(initial);
  useEffect(() => setF(initial), [initial]);
  const set = (k: keyof TenderFilters, v: string) =>
    setF({ ...f, [k]: v === '' ? undefined : k === 'valorMin' || k === 'valorMax' ? Number(v) : v });

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(f);
      }}
    >
      <fieldset className="filters">
        <legend>Filtros de búsqueda</legend>
        <Field label="Palabra clave" value={f.q ?? ''} onChange={(e) => set('q', e.target.value)} />
        <Field label="Departamento" value={f.departamento ?? ''} onChange={(e) => set('departamento', e.target.value)} />
        <Field label="Modalidad" value={f.modalidad ?? ''} onChange={(e) => set('modalidad', e.target.value)} />
        <Field label="Valor mínimo (COP)" type="number" inputMode="numeric" value={f.valorMin ?? ''} onChange={(e) => set('valorMin', e.target.value)} />
        <Field label="Valor máximo (COP)" type="number" inputMode="numeric" value={f.valorMax ?? ''} onChange={(e) => set('valorMax', e.target.value)} />
        <Field label="Desde" type="date" value={f.fechaDesde ?? ''} onChange={(e) => set('fechaDesde', e.target.value)} />
        <Field label="Hasta" type="date" value={f.fechaHasta ?? ''} onChange={(e) => set('fechaHasta', e.target.value)} />
        <div className="filters-actions">
          <Button type="submit" icon={<SearchIcon />}>
            Buscar
          </Button>
          <Button type="button" variant="secondary" icon={<SaveIcon />} onClick={onSave}>
            Guardar búsqueda
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

function readFilters(p: URLSearchParams): TenderFilters {
  const f: TenderFilters = {};
  const s = (k: keyof TenderFilters) => {
    const v = p.get(k);
    if (v) (f as Record<string, unknown>)[k] = v;
  };
  (['q', 'entidad', 'departamento', 'modalidad', 'estado', 'orden', 'fechaDesde', 'fechaHasta'] as const).forEach(s);
  if (p.get('valorMin')) f.valorMin = Number(p.get('valorMin'));
  if (p.get('valorMax')) f.valorMax = Number(p.get('valorMax'));
  f.page = Number(p.get('page') ?? 1);
  return f;
}

function toParams(f: TenderFilters): URLSearchParams {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) p.set(k, String(v));
  });
  return p;
}

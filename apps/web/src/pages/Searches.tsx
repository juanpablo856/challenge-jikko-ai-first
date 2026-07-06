import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SavedSearch, TenderFilters } from '@portal/contracts';
import { api } from '../api';
import { Button } from '../components/ui/Button';
import { Status } from '../components/ui/Status';
import { SearchIcon, TrashIcon } from '../components/ui/Icons';

// Human-readable labels for the normalized filter keys shown as chips.
const LABELS: Partial<Record<keyof TenderFilters, string>> = {
  q: 'Palabra clave',
  entidad: 'Entidad',
  departamento: 'Departamento',
  modalidad: 'Modalidad',
  valorMin: 'Valor mínimo',
  valorMax: 'Valor máximo',
  fechaDesde: 'Desde',
  fechaHasta: 'Hasta',
  estado: 'Estado',
  orden: 'Orden',
};

function summarize(c: TenderFilters): [string, string][] {
  return (Object.entries(c) as [keyof TenderFilters, unknown][])
    .filter(([k, v]) => LABELS[k] && v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => [LABELS[k]!, String(v)]);
}

export function SearchesPage() {
  const [items, setItems] = useState<SavedSearch[] | null>(null);
  const navigate = useNavigate();
  const load = () => api.listSearches().then(setItems);
  useEffect(() => {
    load();
  }, []);

  const remove = async (s: SavedSearch) => {
    if (!confirm(`¿Eliminar la búsqueda "${s.nombre}"?`)) return;
    await api.removeSearch(s.id);
    load();
  };

  // Apply = load the saved criteria into the Explore URL, which re-runs the search.
  const apply = (criteria: TenderFilters) => {
    const p = new URLSearchParams();
    Object.entries(criteria).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) p.set(k, String(v));
    });
    navigate(`/?${p.toString()}`);
  };

  if (!items) return <Status tone="info">Cargando tus búsquedas guardadas…</Status>;

  return (
    <div>
      <h1 className="page-title">Búsquedas guardadas</h1>
      {items.length === 0 ? (
        <p className="empty">Aún no has guardado ninguna búsqueda.</p>
      ) : (
        <ul className="list">
          {items.map((s) => {
            const chips = summarize(s.criteria);
            return (
              <li key={s.id} className="card">
                <div>
                  <strong>{s.nombre}</strong>
                  {chips.length > 0 ? (
                    <ul className="criteria">
                      {chips.map(([label, value]) => (
                        <li key={label}>
                          <span className="muted">{label}:</span> {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">Sin filtros específicos.</p>
                  )}
                </div>
                <div className="page-actions">
                  <Button icon={<SearchIcon />} aria-label={`Aplicar búsqueda: ${s.nombre}`} onClick={() => apply(s.criteria)}>
                    Aplicar
                  </Button>
                  <Button
                    variant="danger"
                    icon={<TrashIcon />}
                    aria-label={`Eliminar búsqueda: ${s.nombre}`}
                    onClick={() => remove(s)}
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

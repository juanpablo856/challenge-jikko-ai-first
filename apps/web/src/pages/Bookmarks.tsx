import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Bookmark } from '@portal/contracts';
import { api } from '../api';
import { Button } from '../components/ui/Button';
import { Status } from '../components/ui/Status';
import { TrashIcon } from '../components/ui/Icons';

export function BookmarksPage() {
  const [items, setItems] = useState<Bookmark[] | null>(null);
  const load = () => api.listBookmarks().then(setItems);
  useEffect(() => {
    load();
  }, []);

  const remove = async (b: Bookmark) => {
    const titulo = b.snapshot.titulo ?? b.noticeUid;
    if (!confirm(`¿Quitar "${titulo}" de tus convocatorias guardadas?`)) return;
    await api.removeBookmark(b.id);
    load();
  };

  if (!items) return <Status tone="info">Cargando tus convocatorias guardadas…</Status>;

  return (
    <div>
      <h1 className="page-title">Convocatorias guardadas</h1>
      {items.length === 0 ? (
        <p className="empty">Aún no has guardado ninguna convocatoria.</p>
      ) : (
        <ul className="list">
          {items.map((b) => {
            const titulo = b.snapshot.titulo ?? b.noticeUid;
            return (
              <li key={b.id} className="card">
                <div>
                  <Link to={`/tenders/${encodeURIComponent(b.noticeUid)}`}>
                    <strong>{titulo}</strong>
                  </Link>
                  <div className="muted">
                    {b.snapshot.entidad} · guardada el {b.created_at}
                  </div>
                  {b.note && <p>{b.note}</p>}
                </div>
                <Button
                  variant="danger"
                  icon={<TrashIcon />}
                  aria-label={`Quitar de guardadas: ${titulo}`}
                  onClick={() => remove(b)}
                >
                  Quitar
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

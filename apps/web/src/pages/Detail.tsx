import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { TenderDetail } from '@portal/contracts';
import { api } from '../api';
import { Button } from '../components/ui/Button';
import { Status } from '../components/ui/Status';
import { BookmarkIcon, ChevronLeftIcon } from '../components/ui/Icons';

const money = (v: number | null | undefined) =>
  v == null ? '—' : v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export function DetailPage() {
  const { uid = '' } = useParams();
  const [detail, setDetail] = useState<TenderDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'idle' | 'error' | 'notfound'>('loading');

  useEffect(() => {
    api
      .tenderDetail(uid)
      .then((d) => {
        setDetail(d);
        setStatus('idle');
      })
      .catch((e) => setStatus((e as Error).message.includes('404') ? 'notfound' : 'error'));
  }, [uid]);

  if (status === 'loading') return <Status tone="info">Cargando el detalle…</Status>;
  if (status === 'notfound') return <p className="empty">Esta convocatoria ya no está disponible en la fuente oficial.</p>;
  if (status === 'error' || !detail) return <Status tone="error">No pudimos cargar el detalle. Intenta de nuevo.</Status>;

  const bookmark = async () => {
    try {
      await api.addBookmark({ noticeUid: detail.noticeUid });
      alert('Convocatoria guardada.');
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const titulo = detail.titulo ?? detail.noticeUid;

  return (
    <article className="card">
      <p>
        <Link to="/">
          <ChevronLeftIcon aria-hidden="true" /> Volver a explorar
        </Link>
      </p>
      <h1 className="page-title">{titulo}</h1>
      <dl className="detail">
        <dt>Entidad</dt>
        <dd>{detail.entidad ?? '—'}</dd>
        <dt>Departamento</dt>
        <dd>{detail.departamento ?? '—'}</dd>
        <dt>Modalidad</dt>
        <dd>{detail.modalidad ?? '—'}</dd>
        <dt>Estado</dt>
        <dd>{detail.estado ?? '—'}</dd>
        <dt>Valor</dt>
        <dd>{money(detail.valor)}</dd>
        <dt>Fecha</dt>
        <dd>{detail.fecha ?? '—'}</dd>
      </dl>
      {detail.descripcion && <p>{detail.descripcion}</p>}

      <div className="page-actions">
        <Button icon={<BookmarkIcon />} aria-label={`Guardar convocatoria: ${titulo}`} onClick={bookmark}>
          Guardar
        </Button>
      </div>

      {detail.enriquecimiento && (
        <section className="enrichment" aria-labelledby="enrichment-title">
          <h2 id="enrichment-title">Información complementaria (Croma)</h2>
          {detail.enriquecimiento.capped && (
            <p className="muted">Datos limitados por el tope de la fuente.</p>
          )}
          <pre>{JSON.stringify(detail.enriquecimiento, null, 2)}</pre>
        </section>
      )}
    </article>
  );
}

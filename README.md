# Portal de Convocatorias Públicas

MVP para explorar, filtrar y guardar convocatorias de contratación pública colombiana
(SECOP I). Los datos de convocatorias se consultan **en vivo** desde SECOP; solo se
persisten datos del usuario (auth, bookmarks, búsquedas guardadas) en SQLite.

## Stack

- **API**: Node.js + TypeScript + Fastify (`apps/api`)
- **Web**: React + Vite + TypeScript (`apps/web`)
- **Contratos compartidos**: `packages/contracts`
- **Persistencia**: SQLite (`better-sqlite3`) — tablas `usuarios`, `bookmarks`, `busquedas`
- **Auth**: JWT (HS256)
- **Fuentes externas**: SODA/Socrata (`datos.gov.co`) para búsqueda; Croma (opcional) para detalle

## Requisitos

- Node.js ≥ 20 (probado en 25)
- npm ≥ 10

## Configuración

Copia `.env.example` a `.env` y ajusta:

| Variable          | Requerida | Descripción                                                        |
| ----------------- | --------- | ------------------------------------------------------------------ |
| `JWT_SECRET`      | **Sí**    | Secreto de firma JWT (≥ 16 chars). El arranque falla si falta.     |
| `SODA_APP_TOKEN`  | No        | Token de app SODA; recomendado para evitar throttling por IP.      |
| `CROMA_API_KEY`   | No        | Habilita el enriquecimiento de detalle vía Croma.                  |
| `PORT`            | No        | Puerto de la API (default 3000).                                   |
| `DATABASE_PATH`   | No        | Ruta del archivo SQLite (default `./data/portal.sqlite`).          |
| `JWT_EXPIRES_IN`  | No        | Expiración del token (default `1h`).                               |
| `SODA_DATASET`    | No        | Resource id del dataset SECOP I en SODA (default `jbjy-vk9h`).     |

> **Nota sobre el dataset SODA**: el mapeo de columnas vive en `apps/api/src/tenders/soda.ts`
> (constante `COL`). Verifica el `SODA_DATASET` y los nombres de columna contra el dataset
> real antes de producción — es la pregunta abierta del diseño.

## Uso

```bash
npm install            # instala todos los workspaces
export JWT_SECRET=algo-de-al-menos-16-chars
npm run dev            # arranca API (:3000) y web (:5173) en paralelo
```

- Web: http://localhost:5173 (proxied `/api` → API :3000)
- OpenAPI/Swagger UI: http://localhost:3000/docs

Otros scripts (raíz): `npm test`, `npm run build`, `npm run lint`, `npm run format`.

## Arquitectura

Puerto hexagonal `TenderSource` (`apps/api/src/tenders/port.ts`) con adaptadores
`SodaTenderSource` (búsqueda) y `CromaEnrichmentSource` (enriquecimiento opcional del
detalle). `TenderService` añade caché con TTL y degradación (stale-on-error / 502). El
modelo de filtros normalizado desacopla el cliente y las búsquedas guardadas de la sintaxis
SODA.

## Pruebas

```bash
npm test               # Vitest en API y Web
```

Los tests de la API usan `app.inject()` (sin red) con una fuente falsa y SQLite en memoria.

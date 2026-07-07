```
┌───────────────────────────────────┐
│ CLIENTE · apps/web                │
│ React + Vite (SPA)                │
└───────────────────────────────────┘
          │ fetch /api/* → :3000 (proxy)
          ▼
┌───────────────────────────────────┐        ┌──────────────────────────────┐
│ API · apps/api · Fastify          │───────►│ SQLite · better-sqlite3      │
│ JWT · rate-limit · helmet · CORS  │  auth  │ usuarios·bookmarks·busquedas │
└───────────────────────────────────┘        │ (nunca convocatorias)        │
          │                                  └──────────────────────────────┘
          ▼
┌───────────────────────────────────┐
│ CORE · hexagonal                  │
│ TenderService (cache TTL + degr.) │
└───────────────────────────────────┘
          │ puerto TenderSource
          ├──────────────────┐
          ▼                  ▼
┌────────────────────┐  ┌────────────────────────┐
│ SodaTenderSource   │  │ CromaEnrichmentSource  │
│ → datos.gov.co     │  │ → Croma API (opcional) │
└────────────────────┘  └────────────────────────┘
```
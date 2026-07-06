## Context

Proyecto greenfield. El objetivo es un MVP funcional y mantenible, no una plataforma a escala. Restricciones fijadas por el partner:

- Backend **Node.js + TypeScript + Fastify**; frontend **React + Vite + TypeScript**.
- Persistencia **SQLite** con exactamente tres tablas de dominio: `usuarios`, `bookmarks`, `busquedas`.
- Autenticación **JWT**.
- Datos de convocatorias obtenidos **en vivo** de SECOP I; el portal no es la fuente de verdad de esos datos.

Dependencias externas y su naturaleza:
- **SODA (Socrata) API de `datos.gov.co`**: soporta full-text (`$q`), filtros arbitrarios (`$where`), proyección (`$select`), orden (`$order`) y paginación (`$limit`/`$offset`). Es la única fuente adecuada para *descubrimiento*.
- **Croma (`api.croma.run/co/secop`)**: API de *lookup* (por `notice_uid`, NIT de proveedor, NIT de entidad), con datos normalizados y unidos (contratos adjudicados, métricas de ejecución). Requiere `Authorization: Bearer`. Tope de 500 registros, sin rate limits/pricing documentados. **No** sirve para búsqueda general.

## Goals / Non-Goals

**Goals:**
- Contrato REST claro y estable entre `apps/web` y `apps/api`.
- Aislar las fuentes de datos externas tras un puerto `TenderSource` para poder testear con dobles y cambiar/añadir adaptadores sin tocar el núcleo.
- Guardar solo datos del usuario en SQLite; los bookmarks conservan un *snapshot mínimo* para sobrevivir a cambios/eliminaciones en SECOP.
- Degradación elegante ante fallo/lentitud de las fuentes externas (timeouts, caché, errores 502/504 controlados).
- Seguridad básica sólida: hash de contraseñas, JWT firmado, validación de entrada, aislamiento por usuario.

**Non-Goals:**
- Sincronización/replicación completa de SECOP a una tabla local (descartado: contradice el esquema de 3 tablas y añade complejidad de sync).
- Roles/permisos avanzados, organizaciones, compartición entre usuarios.
- Notificaciones/alertas sobre búsquedas guardadas (posible evolución futura).
- Uso del MCP de Croma en runtime: el MCP es para agentes de IA, no para el data-path del servicio.

## Decisions

### D1. SODA como fuente primaria; Croma como enriquecimiento de detalle
SODA cubre búsqueda por texto y filtros arbitrarios con paginación; Croma no puede descubrir convocatorias sin un identificador previo. **Decisión**: `tender-exploration.search` usa el adaptador SODA; `tender-exploration.detail` usa SODA para el registro base y, si hay `CROMA_API_KEY` y un `notice_uid` válido, **enriquece** con Croma. *Alternativas*: (a) solo SODA — más simple, pierde métricas de ejecución/contratos adjudicados; (b) solo Croma — inviable para búsqueda. *Trade-off aceptado*: dos dependencias externas a cambio de mejor detalle.

### D2. Puerto `TenderSource` (arquitectura hexagonal)
Interfaz de dominio `TenderSource { search(criteria): Page<TenderSummary>; getByNoticeUid(uid): TenderDetail | null }` con adaptadores `SodaTenderSource` y `CromaEnrichmentSource`. El núcleo (casos de uso) depende de la interfaz, no de HTTP concreto. *Beneficio*: tests sin red, sustitución de fuente, límites explícitos. *Alternativa*: llamar SODA directo desde los handlers — más rápido de escribir, peor de testear y mantener.

### D3. Modelo de datos SQLite (solo datos de usuario)
- `usuarios(id PK, email UNIQUE, password_hash, created_at)`
- `bookmarks(id PK, user_id FK, notice_uid, snapshot_json, note, created_at, UNIQUE(user_id, notice_uid))` — `snapshot_json` guarda título, entidad, valor y fecha al momento de guardar (resiliencia D6).
- `busquedas(id PK, user_id FK, nombre, criteria_json, created_at, UNIQUE(user_id, nombre))` — `criteria_json` serializa los filtros normalizados.
Índices por `user_id`. Acceso vía `better-sqlite3` (síncrono, simple) con migraciones versionadas.

### D4. Autenticación JWT
Registro con hash **bcrypt/argon2** (coste configurable). Login emite un **access token** JWT firmado (HS256, secreto en `JWT_SECRET`) con `sub=user_id`, expiración corta (p.ej. 1h). Rutas de dominio protegidas por un hook `preHandler` que valida el token y adjunta `request.user`. *MVP sin refresh tokens*; se documenta como evolución. *Alternativa*: sesiones server-side — innecesario para SPA + API stateless.

### D5. Contrato de filtros normalizado
La API expone un modelo de filtros estable (`q`, `entidad`, `departamento`, `modalidad`, `valorMin`, `valorMax`, `fechaDesde`, `fechaHasta`, `estado`, `orden`, `page`, `pageSize`) que el `SodaTenderSource` traduce a parámetros SODA (`$q`, `$where`, `$order`, `$limit`, `$offset`). Esto desacopla el cliente y las búsquedas guardadas de la sintaxis SODA, y permite cambiar de fuente sin romper `busquedas` persistidas.

### D6. Snapshot en bookmarks
Al guardar un bookmark se persiste un snapshot mínimo del resumen. Si SECOP deja de exponer el registro, la UI sigue mostrando lo esencial y marca el detalle como "no disponible en la fuente". *Trade-off*: dato potencialmente desactualizado, mitigado mostrando `created_at` y permitiendo "refrescar".

### D7. Caché corta y resiliencia
Caché en memoria con TTL (p.ej. 60s búsquedas, 300s detalle) por clave de criterios/uid. Timeouts a las fuentes externas; ante error upstream se responde `502/504` con cuerpo de error tipado y, si hay caché válida, se sirve stale. *Alternativa*: sin caché — más simple pero peor UX y más carga externa.

## Risks / Trade-offs

- [Cambios de esquema/columnas en el dataset SECOP SODA] → Aislar el mapeo en `SodaTenderSource`; tests de contrato contra un fixture de respuesta real; el resto del sistema usa el modelo normalizado.
- [Indisponibilidad o latencia de SODA/Croma] → Timeouts + caché + degradación elegante (D7); Croma es opcional, su fallo no rompe el detalle base.
- [Sin rate limits/pricing documentados en Croma y tope de 500] → Usar Croma solo en detalle puntual (no en listados); respetar `capped`; feature-flag por `CROMA_API_KEY`.
- [Snapshots desactualizados en bookmarks] → Mostrar antigüedad y opción de refresco (D6).
- [Fuga de credenciales (JWT_SECRET, CROMA_API_KEY)] → Config por entorno, nunca en repo; validación de arranque que falla si faltan secretos requeridos.
- [Enumeración de usuarios en login/registro] → Respuestas y tiempos uniformes; mensajes genéricos.
- [Inyección en `$where` de SODA] → Construir el `$where` con parámetros validados/escapados desde el modelo normalizado, nunca concatenando entrada cruda.

## Migration Plan

Greenfield: no hay migración de datos. Despliegue inicial crea el esquema SQLite vía migración `0001_init`. Rollback = destruir el archivo SQLite (no hay datos productivos aún). Variables requeridas al arranque: `JWT_SECRET`, `SODA_APP_TOKEN` (opcional pero recomendado para límites SODA), `CROMA_API_KEY` (opcional).

## Open Questions

- ¿Se requiere `SODA_APP_TOKEN`? (Sin token SODA aplica throttling por IP; recomendado registrarlo.)
- ¿Qué dataset/resource id exacto de SECOP I usaremos como fuente canónica en SODA? (A fijar en el adaptador durante la implementación.)
- ¿Expiración del JWT y política de "recordarme"? (MVP: 1h, sin refresh.)

## 1. Andamiaje del monorepo

- [x] 1.1 Inicializar monorepo con workspaces: `apps/api` (Fastify+TS), `apps/web` (React+Vite+TS), `packages/contracts` (tipos/DTOs compartidos)
- [x] 1.2 Configurar TypeScript, ESLint, Prettier y scripts (`dev`, `build`, `test`, `lint`) en raíz y workspaces
- [x] 1.3 Configurar variables de entorno (`JWT_SECRET`, `SODA_APP_TOKEN?`, `CROMA_API_KEY?`) con validación de arranque que falla si faltan las requeridas
- [x] 1.4 Configurar runner de pruebas (Vitest) y un cliente HTTP de test para la API

## 2. Persistencia SQLite

- [x] 2.1 Integrar `better-sqlite3` y un mecanismo simple de migraciones versionadas
- [x] 2.2 Migración `0001_init`: tablas `usuarios`, `bookmarks`, `busquedas` con índices por `user_id` y unicidades (`usuarios.email`, `bookmarks(user_id,notice_uid)`, `busquedas(user_id,nombre)`)
- [x] 2.3 Repositorios de acceso a datos (users, bookmarks, searches) con pruebas unitarias

## 3. Autenticación JWT (capability: user-auth)

- [x] 3.1 Servicio de hashing de contraseñas (bcrypt/argon2) con coste configurable
- [x] 3.2 `POST /auth/register` con validación de email/password y manejo de duplicados (409)
- [x] 3.3 `POST /auth/login` con emisión de JWT (HS256, `sub`, `exp`) y respuesta genérica ante credenciales inválidas (401)
- [x] 3.4 Hook `preHandler` de autenticación que valida el JWT y adjunta `request.user`
- [x] 3.5 `GET /auth/me` y protección de rutas de dominio
- [x] 3.6 Pruebas de todos los escenarios de user-auth (éxito, duplicado, inválido, sin token, token expirado)

## 4. Fuente de datos y núcleo de exploración (capability: tender-exploration)

- [x] 4.1 Definir el puerto `TenderSource` y el modelo de filtros normalizado (`q`, `entidad`, `departamento`, `modalidad`, `valorMin/Max`, `fechaDesde/Hasta`, `estado`, `orden`, `page`, `pageSize`)
- [x] 4.2 Implementar `SodaTenderSource`: traducción de filtros a `$q`/`$where`/`$order`/`$limit`/`$offset` con validación y escape (anti-inyección); mapeo a `TenderSummary`/`TenderDetail`
- [x] 4.3 Implementar `CromaEnrichmentSource`: lookup por `notice_uid` (`CO1.NTC.<n>`), normalización de `No Definido`/`No Aplica` → `null`, activado por `CROMA_API_KEY`
- [x] 4.4 Caché en memoria con TTL (búsqueda/detalle) y política de stale-on-error
- [x] 4.5 Timeouts y degradación elegante (502/504 tipados) ante fallo de la fuente
- [x] 4.6 `GET /tenders` (búsqueda/filtrado/paginación) y `GET /tenders/:noticeUid` (detalle + enriquecimiento opcional)
- [x] 4.7 Pruebas de contrato con fixtures reales de SODA/Croma y pruebas de escenarios (texto, filtros combinados, paginación, 400, 404, caché, degradación)

## 5. Bookmarks (capability: bookmarks)

- [x] 5.1 `POST /bookmarks` con construcción de `snapshot_json` desde la fuente y control de duplicados (409) / inexistente (404)
- [x] 5.2 `GET /bookmarks` con aislamiento por `user_id` y orden por `created_at` desc
- [x] 5.3 `DELETE /bookmarks/:id` con verificación de propiedad (404 si ajeno/inexistente)
- [x] 5.4 Resiliencia: servir `snapshot_json` cuando la convocatoria ya no existe en la fuente
- [x] 5.5 Pruebas de todos los escenarios de bookmarks

## 6. Búsquedas guardadas (capability: saved-searches)

- [x] 6.1 `POST /searches` validando `criteria` contra el modelo normalizado; unicidad de `nombre` por usuario (409)
- [x] 6.2 `GET /searches` con aislamiento por usuario
- [x] 6.3 `GET /searches/:id/results` que reejecuta los criterios vía `tender-exploration`
- [x] 6.4 `DELETE /searches/:id` con verificación de propiedad
- [x] 6.5 Pruebas de escenarios, incluyendo estabilidad del contrato ante cambio interno de la fuente

## 7. UI de exploración (capability: web-ui)

- [x] 7.1 Enrutamiento y estado de sesión: guardado del JWT, interceptor `Authorization`, guardas de rutas privadas y manejo de 401
- [x] 7.2 Pantallas de registro/login
- [x] 7.3 Vista de exploración: panel de filtros, listado paginado, estados de carga/vacío/error (incluye indicación de caché stale)
- [x] 7.4 Vista de detalle con sección diferenciada de enriquecimiento (Croma)
- [x] 7.5 Gestión de bookmarks (marcar/desmarcar, vista de guardados)
- [x] 7.6 Gestión de búsquedas guardadas (guardar filtros actuales, listar, aplicar)
- [x] 7.7 Pruebas de componentes/flujos clave de la UI

## 8. Calidad, seguridad y entrega

- [x] 8.1 Validación de entrada centralizada (esquemas) en todos los endpoints
- [x] 8.2 Manejo de errores uniforme y respuestas tipadas; sin fuga de detalles internos
- [x] 8.3 Endurecimiento: CORS, rate limiting básico, cabeceras de seguridad, secretos solo por entorno
- [x] 8.4 Documentación OpenAPI de la API y README de arranque (env vars, `dataset id` de SECOP)
- [x] 8.5 Pruebas de integración end-to-end de los flujos principales
- [x] 8.6 `openspec validate add-portal-convocatorias-mvp --strict` en verde y preparación para `/opsx:apply`

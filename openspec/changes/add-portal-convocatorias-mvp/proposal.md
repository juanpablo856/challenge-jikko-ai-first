## Why

Los datos de contratación pública colombiana (SECOP I) son abiertos pero difíciles de explorar: la interfaz oficial y la API SODA de `datos.gov.co` no ofrecen una experiencia de búsqueda personalizada ni permiten a un usuario guardar convocatorias de interés o reutilizar filtros. Este cambio introduce el MVP de un **Portal de Convocatorias Públicas** que permite a usuarios registrados explorar, filtrar y guardar licitaciones, autenticándose con JWT y persistiendo únicamente datos propios del usuario en SQLite.

## What Changes

- Nuevo backend REST (Node.js + TypeScript + Fastify) con autenticación **JWT** (registro, login, rutas protegidas).
- Nueva base de datos **SQLite** con tres tablas de dominio: `usuarios`, `bookmarks`, `busquedas`. Las convocatorias **no** se persisten; se consultan en vivo contra SECOP I.
- Nuevo puerto `TenderSource` (patrón hexagonal) con:
  - Adaptador **SODA (Socrata)** como fuente primaria de búsqueda/filtrado/paginación.
  - Adaptador **Croma** (opcional, `docs.usecroma.com`) para enriquecer el **detalle** de una convocatoria por `notice_uid`.
- Nueva API REST para: búsqueda/filtrado de convocatorias, detalle enriquecido, gestión de bookmarks y gestión de búsquedas guardadas.
- Nueva **UI de exploración** (React + Vite + TypeScript): listado con filtros, detalle, bookmarks y búsquedas guardadas.
- Caché corta (TTL en memoria) sobre las respuestas de SECOP para reducir latencia y presión sobre la fuente externa.

## Capabilities

### New Capabilities
- `user-auth`: registro de usuarios, inicio de sesión, emisión/validación de JWT y protección de rutas.
- `tender-exploration`: búsqueda, filtrado y paginación de convocatorias desde SECOP I vía SODA, más vista de detalle enriquecida (Croma) y caché.
- `bookmarks`: guardar, listar y eliminar convocatorias marcadas por el usuario (con snapshot mínimo para resiliencia).
- `saved-searches`: guardar, listar, aplicar y eliminar criterios de filtro reutilizables ("búsquedas").
- `web-ui`: experiencia de exploración en el cliente (listado, filtros, detalle, estados de carga/error, gestión de bookmarks y búsquedas).

### Modified Capabilities
<!-- Ninguna: proyecto greenfield, no existen specs previas en openspec/specs/. -->

## Impact

- **Código nuevo**: monorepo con `apps/api` (Fastify) y `apps/web` (React/Vite); paquete compartido de tipos/contratos.
- **APIs nuevas**: `/auth/*`, `/tenders*`, `/bookmarks*`, `/searches*`.
- **Dependencias externas**: SECOP I vía SODA (`datos.gov.co`), Croma (`api.croma.run`, requiere API key). Ambas son dependencias de disponibilidad; el sistema debe degradar con elegancia.
- **Datos**: SQLite local (`usuarios`, `bookmarks`, `busquedas`). Sin datos de contratación persistidos → menor superficie de cumplimiento/actualización.
- **Seguridad**: manejo de contraseñas (hash), secreto JWT, y API key de Croma como configuración sensible.

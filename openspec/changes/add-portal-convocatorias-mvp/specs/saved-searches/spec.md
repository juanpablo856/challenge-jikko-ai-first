## ADDED Requirements

### Requirement: Guardar una búsqueda
El sistema SHALL permitir a un usuario autenticado guardar un conjunto de criterios de filtro normalizados bajo un nombre, en la tabla `busquedas`. Los nombres SHALL ser únicos por usuario.

#### Scenario: Guardado exitoso
- **WHEN** se envía `POST /searches` con `{ nombre, criteria }` válidos y token válido
- **THEN** el sistema persiste `user_id`, `nombre`, `criteria_json` (modelo de filtros normalizado) y `created_at`
- **AND** responde `201` con la búsqueda creada

#### Scenario: Nombre duplicado
- **WHEN** el usuario intenta guardar una búsqueda con un `nombre` que ya usó
- **THEN** el sistema responde `409` y no crea un duplicado (unicidad por `user_id` + `nombre`)

#### Scenario: Criterios inválidos
- **WHEN** `criteria` contiene campos desconocidos o valores fuera de rango
- **THEN** el sistema responde `400` con los errores de validación y no persiste nada

### Requirement: Listar búsquedas guardadas
El sistema SHALL devolver únicamente las búsquedas del usuario autenticado.

#### Scenario: Listado propio
- **WHEN** se envía `GET /searches` con token válido
- **THEN** el sistema responde `200` con las búsquedas del usuario ordenadas por `created_at` descendente

#### Scenario: Aislamiento entre usuarios
- **WHEN** el usuario A lista sus búsquedas
- **THEN** el sistema nunca incluye búsquedas de otro usuario

### Requirement: Aplicar una búsqueda guardada
El sistema SHALL permitir ejecutar una búsqueda guardada, reutilizando sus criterios contra `tender-exploration`.

#### Scenario: Aplicación exitosa
- **WHEN** se envía `GET /searches/:id/results` (o el cliente reenvía `criteria_json` a `GET /tenders`) con token válido sobre una búsqueda propia
- **THEN** el sistema ejecuta la búsqueda con los criterios guardados y responde `200` con resultados paginados

#### Scenario: Contrato estable ante cambio de fuente
- **WHEN** se aplica una búsqueda guardada previamente y la traducción a la fuente externa ha cambiado internamente
- **THEN** el sistema sigue interpretando `criteria_json` mediante el modelo normalizado, sin requerir migración de las búsquedas guardadas

### Requirement: Eliminar búsqueda guardada
El sistema SHALL permitir eliminar una búsqueda propia.

#### Scenario: Eliminación exitosa
- **WHEN** se envía `DELETE /searches/:id` sobre una búsqueda del propio usuario
- **THEN** el sistema elimina la fila y responde `204`

#### Scenario: Búsqueda de otro usuario o inexistente
- **WHEN** se envía `DELETE /searches/:id` sobre un id inexistente o de otro usuario
- **THEN** el sistema responde `404` y no elimina nada

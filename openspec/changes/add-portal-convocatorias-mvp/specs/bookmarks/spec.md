## ADDED Requirements

### Requirement: Guardar convocatoria como bookmark
El sistema SHALL permitir a un usuario autenticado guardar una convocatoria por `notice_uid`, persistiendo un snapshot mínimo del resumen para resiliencia. Un usuario SHALL NOT tener bookmarks duplicados de la misma convocatoria.

#### Scenario: Guardado exitoso
- **WHEN** se envía `POST /bookmarks` con `{ noticeUid, note? }` y token válido
- **THEN** el sistema crea una fila en `bookmarks` con `user_id`, `notice_uid`, `snapshot_json` (título, entidad, valor, fecha), `note` y `created_at`
- **AND** responde `201` con el bookmark creado

#### Scenario: Bookmark duplicado
- **WHEN** el usuario intenta guardar un `noticeUid` que ya tiene guardado
- **THEN** el sistema responde `409` y no crea un duplicado (unicidad por `user_id` + `notice_uid`)

#### Scenario: Convocatoria inexistente al guardar
- **WHEN** el `noticeUid` no puede resolverse en la fuente para construir el snapshot
- **THEN** el sistema responde `404` y no crea el bookmark

### Requirement: Listar bookmarks del usuario
El sistema SHALL devolver únicamente los bookmarks del usuario autenticado.

#### Scenario: Listado propio
- **WHEN** se envía `GET /bookmarks` con token válido
- **THEN** el sistema responde `200` con los bookmarks cuyo `user_id` coincide con el del token, ordenados por `created_at` descendente

#### Scenario: Aislamiento entre usuarios
- **WHEN** el usuario A solicita la lista de bookmarks
- **THEN** el sistema nunca incluye bookmarks pertenecientes a otro usuario

### Requirement: Eliminar bookmark
El sistema SHALL permitir eliminar un bookmark propio.

#### Scenario: Eliminación exitosa
- **WHEN** se envía `DELETE /bookmarks/:id` sobre un bookmark del propio usuario
- **THEN** el sistema elimina la fila y responde `204`

#### Scenario: Bookmark de otro usuario o inexistente
- **WHEN** se envía `DELETE /bookmarks/:id` sobre un id que no existe o pertenece a otro usuario
- **THEN** el sistema responde `404` y no elimina nada

### Requirement: Resiliencia del snapshot
El sistema SHALL mostrar la información esencial del bookmark aun si la convocatoria ya no está disponible en la fuente.

#### Scenario: Convocatoria eliminada en la fuente
- **WHEN** se lista un bookmark cuya convocatoria ya no existe en SECOP
- **THEN** el sistema devuelve el `snapshot_json` guardado y marca el detalle en vivo como no disponible

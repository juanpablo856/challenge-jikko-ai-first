## ADDED Requirements

### Requirement: Autenticación en el cliente
La UI SHALL permitir registro e inicio de sesión, almacenar el JWT de forma segura y proteger las vistas privadas.

#### Scenario: Login y acceso a vistas privadas
- **WHEN** un usuario inicia sesión con credenciales válidas
- **THEN** la UI guarda el `accessToken`, adjunta `Authorization: Bearer` a las peticiones y habilita las vistas de exploración, bookmarks y búsquedas

#### Scenario: Sesión ausente o expirada
- **WHEN** el usuario no ha iniciado sesión o su token expiró (respuesta `401`)
- **THEN** la UI redirige a la pantalla de login y no muestra datos privados

### Requirement: Exploración con filtros
La UI SHALL ofrecer una vista de listado de convocatorias con controles de filtro y paginación que consumen `GET /tenders`.

#### Scenario: Aplicar filtros
- **WHEN** el usuario ajusta filtros (texto, departamento, modalidad, rango de valor, rango de fechas) y confirma
- **THEN** la UI solicita los resultados correspondientes y actualiza el listado con paginación

#### Scenario: Estado de carga y error
- **WHEN** una búsqueda está en curso o la fuente externa falla
- **THEN** la UI muestra estados explícitos de carga y de error (incluyendo el caso de resultado servido desde caché stale) sin bloquear la interfaz

#### Scenario: Sin resultados
- **WHEN** una búsqueda no devuelve elementos
- **THEN** la UI muestra un estado vacío claro con sugerencia de ajustar filtros

### Requirement: Detalle de convocatoria
La UI SHALL mostrar el detalle de una convocatoria seleccionada, incluyendo el enriquecimiento cuando esté disponible.

#### Scenario: Ver detalle
- **WHEN** el usuario abre una convocatoria del listado
- **THEN** la UI muestra el `TenderDetail`, y cuando existan datos de enriquecimiento (Croma) los presenta en una sección diferenciada

### Requirement: Gestión de bookmarks desde la UI
La UI SHALL permitir guardar, listar y eliminar bookmarks.

#### Scenario: Guardar y ver bookmarks
- **WHEN** el usuario marca una convocatoria como guardada
- **THEN** la UI refleja el estado guardado y la convocatoria aparece en la vista de bookmarks

#### Scenario: Eliminar bookmark
- **WHEN** el usuario elimina un bookmark
- **THEN** la UI actualiza la lista quitando el elemento y refleja el estado no guardado en la exploración

### Requirement: Gestión de búsquedas guardadas desde la UI
La UI SHALL permitir guardar la búsqueda actual, listarlas y volver a aplicarlas.

#### Scenario: Guardar la búsqueda actual
- **WHEN** el usuario asigna un nombre a los filtros activos y confirma
- **THEN** la UI persiste la búsqueda vía `POST /searches` y la muestra en la lista de búsquedas guardadas

#### Scenario: Aplicar una búsqueda guardada
- **WHEN** el usuario selecciona una búsqueda guardada
- **THEN** la UI carga sus criterios en los filtros y muestra los resultados correspondientes

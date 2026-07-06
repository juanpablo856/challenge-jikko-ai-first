## ADDED Requirements

### Requirement: Búsqueda y filtrado de convocatorias
El sistema SHALL exponer un endpoint que busque convocatorias en SECOP I a través del adaptador SODA, aceptando un modelo de filtros normalizado y devolviendo resultados paginados. El sistema SHALL NOT persistir las convocatorias.

#### Scenario: Búsqueda por texto libre
- **WHEN** se envía `GET /tenders?q=alcaldía` con token válido
- **THEN** el sistema traduce `q` a `$q` de SODA y responde `200` con una página de `TenderSummary` (id/`notice_uid`, título, entidad, valor, fecha, estado)

#### Scenario: Filtros combinados
- **WHEN** se envían filtros `departamento`, `modalidad`, `valorMin`, `valorMax`, `fechaDesde`, `fechaHasta`
- **THEN** el sistema construye un `$where` de SODA con valores validados y escapados (sin concatenar entrada cruda) y responde solo con resultados que cumplen todos los filtros

#### Scenario: Paginación y orden
- **WHEN** se envían `page`, `pageSize` y `orden`
- **THEN** el sistema aplica `$limit`/`$offset`/`$order` y responde con `{ items, page, pageSize, hasMore }`

#### Scenario: Parámetros inválidos
- **WHEN** un filtro tiene tipo o rango inválido (p.ej. `valorMin > valorMax`, `pageSize` fuera de límite)
- **THEN** el sistema responde `400` con los errores por campo y no llama a la fuente externa

### Requirement: Detalle de convocatoria con enriquecimiento
El sistema SHALL exponer el detalle de una convocatoria por `notice_uid`, usando SODA como base y enriqueciendo con Croma cuando exista `CROMA_API_KEY` y el identificador sea válido.

#### Scenario: Detalle base disponible
- **WHEN** se envía `GET /tenders/:noticeUid` y SODA retorna el registro
- **THEN** el sistema responde `200` con el `TenderDetail` normalizado

#### Scenario: Enriquecimiento con Croma
- **WHEN** existe `CROMA_API_KEY` y `notice_uid` tiene el formato `CO1.NTC.<n>`
- **THEN** el sistema añade al detalle los datos de Croma (contratos adjudicados, métricas de ejecución) normalizando `No Definido`/`No Aplica` a `null`

#### Scenario: Croma no disponible o no configurado
- **WHEN** `CROMA_API_KEY` no está configurada, el `notice_uid` no es compatible, o Croma falla/expira
- **THEN** el sistema responde `200` con el detalle base de SODA sin enriquecimiento y sin propagar el error de Croma

#### Scenario: Convocatoria inexistente
- **WHEN** SODA no encuentra el `notice_uid`
- **THEN** el sistema responde `404`

### Requirement: Caché y degradación ante fallo de la fuente
El sistema SHALL aplicar caché con TTL a las respuestas de SECOP y degradar con elegancia ante indisponibilidad de la fuente externa.

#### Scenario: Respuesta servida desde caché
- **WHEN** se repite una búsqueda idéntica dentro del TTL configurado
- **THEN** el sistema responde desde caché sin llamar nuevamente a la fuente externa

#### Scenario: Fuente externa caída con caché válida
- **WHEN** la fuente SODA no responde dentro del timeout pero existe una entrada en caché
- **THEN** el sistema sirve el resultado de caché (stale) y lo señala en la respuesta

#### Scenario: Fuente externa caída sin caché
- **WHEN** la fuente SODA no responde dentro del timeout y no hay caché
- **THEN** el sistema responde `502`/`504` con un error tipado y accionable, sin exponer detalles internos

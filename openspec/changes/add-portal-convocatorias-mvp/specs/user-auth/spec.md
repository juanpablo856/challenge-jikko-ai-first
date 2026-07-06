## ADDED Requirements

### Requirement: Registro de usuario
El sistema SHALL permitir registrar un usuario con `email` y `password`, almacenando la contraseña únicamente como hash y garantizando unicidad del `email`.

#### Scenario: Registro exitoso
- **WHEN** un visitante envía `POST /auth/register` con un `email` válido no existente y una `password` que cumple la política mínima (≥ 8 caracteres)
- **THEN** el sistema crea un registro en `usuarios` con `password_hash` (bcrypt/argon2), nunca la contraseña en claro
- **AND** responde `201` con `{ id, email }` sin exponer el hash

#### Scenario: Email ya registrado
- **WHEN** se envía `POST /auth/register` con un `email` que ya existe
- **THEN** el sistema responde `409` con un mensaje genérico y no revela detalles que faciliten enumeración

#### Scenario: Datos inválidos
- **WHEN** se envía un `email` con formato inválido o una `password` que no cumple la política mínima
- **THEN** el sistema responde `400` con los errores de validación por campo y no crea el usuario

### Requirement: Inicio de sesión y emisión de JWT
El sistema SHALL autenticar por `email`/`password` y, en caso de éxito, emitir un JWT de acceso firmado (HS256) con `sub` = id de usuario y expiración corta.

#### Scenario: Login exitoso
- **WHEN** se envía `POST /auth/login` con credenciales correctas
- **THEN** el sistema responde `200` con `{ accessToken, expiresIn }`
- **AND** el token contiene `sub`, `iat` y `exp` y está firmado con `JWT_SECRET`

#### Scenario: Credenciales incorrectas
- **WHEN** se envía `POST /auth/login` con `email` inexistente o `password` incorrecta
- **THEN** el sistema responde `401` con un mensaje genérico ("credenciales inválidas"), idéntico para ambos casos, para evitar enumeración de usuarios

### Requirement: Protección de rutas por JWT
El sistema SHALL exigir un JWT válido para todas las rutas de dominio (`/tenders*` cuando aplique, `/bookmarks*`, `/searches*`) y adjuntar la identidad del usuario a la petición.

#### Scenario: Acceso con token válido
- **WHEN** una petición a una ruta protegida incluye `Authorization: Bearer <token>` válido y no expirado
- **THEN** el sistema procesa la petición y expone `request.user` con el `id` del usuario

#### Scenario: Token ausente o inválido
- **WHEN** una petición a una ruta protegida no incluye token, o el token es inválido o expiró
- **THEN** el sistema responde `401` y no ejecuta la lógica de dominio

### Requirement: Perfil del usuario autenticado
El sistema SHALL exponer los datos básicos del usuario autenticado.

#### Scenario: Obtener perfil
- **WHEN** se envía `GET /auth/me` con un token válido
- **THEN** el sistema responde `200` con `{ id, email, created_at }` del usuario dueño del token

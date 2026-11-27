# Task API Express

API REST de gestión de tareas construida con Node.js, TypeScript y Express 5. Las tareas se guardan en MongoDB Atlas mediante Mongoose y permanecen disponibles después de reiniciar la API. Incluye registro de usuarios con contraseñas protegidas, inicio de sesión con tokens JWT, rutas protegidas con permisos por rol y controles de seguridad HTTP.

## Requisitos

- Node.js
- PNPM (el proyecto declara `devEngines.packageManager`, no se puede usar npm)
- Visual Studio Code
- Git
- Postman (para las pruebas)
- Una cuenta de MongoDB Atlas (para `MONGODB_URI`)

## Instalación

```bash
pnpm install
cp .env.example .env
```

Edita `.env` con tus valores reales. Nunca subas `.env` a Git.

## Variables de entorno

| Variable                    | Descripción                                                                       |
| --------------------------- | --------------------------------------------------------------------------------- |
| `PORT`                      | Puerto del servidor (por defecto 3000)                                            |
| `MONGODB_URI`               | Cadena de conexión de Atlas (secreto)                                             |
| `MONGODB_DB_NAME`           | Nombre de la base de datos (`task_api`)                                           |
| `JWT_SECRET`                | Clave para firmar los tokens, de al menos 32 bytes aleatorios (secreto)           |
| `JWT_EXPIRES_IN`            | Duración del token, por ejemplo `15m`, `1h` o `7d` (por defecto `1h`)             |
| `JWT_ISSUER`                | Emisor del token (por defecto `task-api-express`)                                 |
| `JWT_AUDIENCE`              | Audiencia del token (por defecto `task-api-client`)                               |
| `CORS_ORIGIN`               | Único origen web autorizado, por ejemplo `http://localhost:5173` (obligatorio)    |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Periodo del límite de autenticación en milisegundos (por defecto `900000`)        |
| `AUTH_RATE_LIMIT_MAX`       | Solicitudes de autenticación permitidas por IP en cada periodo (por defecto `10`) |

Para generar la clave:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"
```

## Comandos

```bash
pnpm dev           # servidor con recarga (tsx watch)
pnpm check         # comprobación de tipos (tsc --noEmit)
pnpm lint          # ESLint
pnpm test          # pruebas del modelo y los middlewares
pnpm build         # compila a dist/
pnpm start         # ejecuta dist/server.js
pnpm format        # prettier --write
pnpm format:check  # prettier --check
pnpm role:set <correo> <user|admin>  # cambia el rol de un usuario existente
```

Después de cambiar un rol, el usuario debe iniciar sesión otra vez: el token anterior conserva el rol que tenía hasta que vence.

## Endpoints

| Método | Ruta                      | Descripción                                                                                                                                              |
| ------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`                 | Estado del servidor                                                                                                                                      |
| GET    | `/health/database`        | Ping a MongoDB (503 si no responde)                                                                                                                      |
| POST   | `/api/auth/register`      | Registra un usuario (ver [Autenticación](#autenticación)); responde 201                                                                                  |
| POST   | `/api/auth/login`         | Inicia sesión y entrega un token JWT; responde 200                                                                                                       |
| GET    | `/api/auth/me`            | Requiere token; devuelve `data.identity` con `userId` y `role`                                                                                           |
| GET    | `/api/tasks`              | Lista paginada con filtro, búsqueda y orden (ver [Consulta del listado](#consulta-del-listado)); responde `{ "data": [...], "meta": {...} }`             |
| GET    | `/api/tasks/:id`          | Consulta una tarea                                                                                                                                       |
| POST   | `/api/tasks`              | Crea una tarea (`{"title": "...", "description": "...", "priority": "high"}`; `description` y `priority` son opcionales)                                 |
| PATCH  | `/api/tasks/:id`          | Actualización parcial: `title`, `status` (`pending` o `completed`), `priority` o varios a la vez. Rechaza cuerpos vacíos, arreglos y campos desconocidos |
| PATCH  | `/api/tasks/:id/complete` | Marca la tarea como completada                                                                                                                           |
| PATCH  | `/api/tasks/:id/status`   | Actualiza el estado (`{"completed": true}`)                                                                                                              |
| DELETE | `/api/tasks/:id`          | Elimina una tarea (solo `admin`)                                                                                                                         |

Todas las rutas de `/api/tasks` requieren el encabezado `Authorization: Bearer <token>`. Los roles `user` y `admin` pueden consultar, crear, actualizar y completar; solo `admin` puede eliminar. Las tareas no tienen propietario: cualquier usuario autenticado ve todas.

Cada respuesta incluye el encabezado `X-Request-Id`. Los errores usan los códigos `INVALID_ID`, `INVALID_JSON`, `TASK_NOT_FOUND`, `ROUTE_NOT_FOUND`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR`, `QUERY_VALIDATION_ERROR`, `PERSISTENCE_VALIDATION_ERROR`, `DATABASE_UNAVAILABLE`, `AUTH_VALIDATION_ERROR`, `USER_EMAIL_EXISTS`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `PAYLOAD_TOO_LARGE`, `AUTHENTICATION_REQUIRED`, `INVALID_AUTHORIZATION_HEADER`, `FORBIDDEN`, `AUTH_RATE_LIMIT_EXCEEDED` e `INTERNAL_ERROR`.

## Autenticación

`POST /api/auth/register` acepta solo `name` (2 a 80 caracteres), `email`, `password` (mínimo 15 caracteres y máximo 72 bytes) y `confirmPassword` (igual a `password`). El correo se guarda en minúsculas y el rol siempre es `user`.

```json
{
  "name": "Ana Torres",
  "email": "ana.torres@example.com",
  "password": "<CONTRASEÑA>",
  "confirmPassword": "<CONTRASEÑA>"
}
```

`POST /api/auth/login` acepta solo `email` y `password`. Un correo inexistente y una contraseña incorrecta responden el mismo `401 INVALID_CREDENTIALS`.

```json
{
  "data": {
    "user": {
      "id": "<OBJECT_ID>",
      "name": "Ana Torres",
      "email": "ana.torres@example.com",
      "role": "user",
      "createdAt": "<FECHA_ISO>",
      "updatedAt": "<FECHA_ISO>"
    },
    "accessToken": "<TOKEN>",
    "tokenType": "Bearer",
    "expiresIn": "1h"
  }
}
```

El token se firma con HS256 e incluye `sub`, `role`, `iss`, `aud`, `iat` y `exp`.

| Situación                             | Respuesta                          |
| ------------------------------------- | ---------------------------------- |
| Falta el encabezado `Authorization`   | `401 AUTHENTICATION_REQUIRED`      |
| El encabezado no usa `Bearer <token>` | `401 INVALID_AUTHORIZATION_HEADER` |
| Token falso, alterado o vencido       | `401 INVALID_TOKEN`                |
| Rol sin permiso                       | `403 FORBIDDEN`                    |
| Demasiadas solicitudes a `/api/auth`  | `429 AUTH_RATE_LIMIT_EXCEEDED`     |

El límite se aplica a todo `/api/auth` (registro, login y `/me`) y se guarda en memoria.

## Consulta del listado

`GET /api/tasks` acepta estos parámetros (todos opcionales, una sola vez cada uno). Cualquier parámetro desconocido, repetido o inválido responde `422 QUERY_VALIDATION_ERROR` con el detalle en `details`.

| Parámetro     | Predeterminado | Regla                                                                                                                                             |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`        | `1`            | Entero entre 1 y 100000                                                                                                                           |
| `limit`       | `10`           | Entero entre 1 y 50                                                                                                                               |
| `status`      | sin filtro     | `pending` o `completed`                                                                                                                           |
| `search`      | sin búsqueda   | Texto no vacío de hasta 60 caracteres; coincidencia parcial en `title`, sin distinguir mayúsculas; los caracteres especiales se tratan como texto |
| `sortBy`      | `createdAt`    | `createdAt`, `updatedAt`, `title` o `status`                                                                                                      |
| `order`       | `asc`          | `asc` o `desc`                                                                                                                                    |
| `createdFrom` | sin filtro     | Fecha ISO 8601 (`2026-11-01` o `2026-11-01T00:00:00Z`); aplica `createdAt >= createdFrom`                                                         |
| `createdTo`   | sin filtro     | Fecha ISO 8601; aplica `createdAt <= createdTo` y no puede ser anterior a `createdFrom`                                                           |

Una fecha sin hora equivale a las 00:00:00 UTC de ese día. En una URL, el signo `+` de un desfase horario debe escribirse `%2B`.

```text
GET /api/tasks?page=2&limit=5&status=pending&search=api&sortBy=title&order=asc
```

```json
{
  "data": [
    {
      "id": "<OBJECT_ID>",
      "title": "Probar API",
      "status": "pending",
      "priority": "medium",
      "createdAt": "<FECHA_ISO>",
      "updatedAt": "<FECHA_ISO>"
    }
  ],
  "meta": {
    "page": 2,
    "limit": 5,
    "total": 8,
    "totalPages": 2,
    "hasNextPage": false,
    "hasPreviousPage": true
  }
}
```

Sin parámetros se conserva el orden `createdAt` ascendente. El orden siempre incluye `_id` como segundo criterio para que las páginas no repitan tareas.

## Estructura

```text
src/
  config/        configuración de entorno y conexión a MongoDB
  controllers/   traducen HTTP a llamadas al servicio
  errors/        AppError
  middlewares/   request id, autenticación, autorización, seguridad HTTP, validaciones, notFound y errorHandler
  models/        modelos de Mongoose y tipos de tareas y usuarios
  repositories/  único acceso a Mongoose: tareas (filtros, orden, paginación, CRUD) y usuarios
  routes/        rutas de tareas, autenticación y salud
  scripts/       administración local (cambio de rol)
  services/      reglas de negocio, contraseñas, tokens y respuesta pública
  types/         contratos tipados (errores, listado, autenticación e identidad de la solicitud)
  utils/         utilidades
  app.ts         configura Express
  server.ts      conecta a la base de datos y abre el puerto
docs/            pruebas y reflexiones
postman/         colecciones de Postman
tests/           pruebas del modelo y los middlewares
```

## Modelo de datos

Colección `tasks` en la base `task_api`:

| Campo         | Regla                                      |
| ------------- | ------------------------------------------ |
| `title`       | obligatorio, `trim`, máximo 120 caracteres |
| `description` | opcional, `trim`, máximo 300 caracteres    |
| `status`      | `pending` (predeterminado) o `completed`   |
| `priority`    | `low`, `medium` (predeterminado) o `high`  |
| `createdAt`   | automático (`timestamps`)                  |
| `updatedAt`   | automático (`timestamps`)                  |

`versionKey` está desactivado. La API devuelve `id` (string) en lugar de `_id` y nunca expone `__v`. Un id que no sea un ObjectId de 24 caracteres hexadecimales produce `400 INVALID_ID`.

Colección `users`:

| Campo          | Regla                                                        |
| -------------- | ------------------------------------------------------------ |
| `name`         | obligatorio, `trim`, de 2 a 80 caracteres                    |
| `email`        | obligatorio, único, en minúsculas, máximo 254 caracteres     |
| `passwordHash` | hash bcrypt de 12 rondas; `select: false`, nunca se responde |
| `role`         | `user` (predeterminado) o `admin`                            |
| `createdAt`    | automático (`timestamps`)                                    |
| `updatedAt`    | automático (`timestamps`)                                    |

## Documentación de las actividades

- `docs/pruebas-conexion-mongodb.md` y `docs/reflexion-mongodb.md` (A5)
- `docs/pruebas-persistencia-mongodb.md` y `docs/reflexion-modelado-mongodb.md` (A6)
- `postman/postman_collections/Task-API-EC2-F2-A6.postman_collection.json`: carpeta **EC2 F2 A6 Persistencia**
- `docs/pruebas-crud-mongodb.md` y `docs/reflexion-crud-mongodb.md` (A7)
- `postman/postman_collections/Task-API-EC2-F2-A7.postman_collection.json`: carpeta **EC2 F2 A7 CRUD**
- `docs/pruebas-consultas-tareas.md` y `docs/reflexion-consultas-tareas.md` (A8)
- `postman/postman_collections/Task-API-EC2-F3-A8.postman_collection.json`: carpeta **EC2 F3 A8 Consultas**
- `docs/evidencias-ec3-f1-a9.md` y `docs/reflexion-ec3-f1-a9.md` (A9)
- `postman/postman_collections/Task-API-EC3-F1-A9.postman_collection.json`: autenticación y regresión de tareas
- `evidencias/ec3-a10.md` (A10)
- `postman/postman_collections/Task-API-EC3-F2-A10.postman_collection.json`: acceso, roles y controles HTTP

Las colecciones anteriores a la A10 envían las solicitudes de tareas sin token, por lo que en esta rama esas solicitudes responden 401.

## Seguridad

- `.env` está en `.gitignore`; `.env.example` no contiene secretos.
- Las contraseñas se guardan solo como hash bcrypt; no se registran en consola ni se devuelven.
- El registro rechaza `role` y cualquier campo no permitido.
- Las rutas de tareas exigen un JWT válido y la eliminación exige el rol `admin`.
- No existe una ruta HTTP para asignar roles; se hace con `pnpm role:set`.
- Helmet agrega cabeceras de seguridad y CORS solo autoriza `CORS_ORIGIN`. CORS no sustituye la autenticación.
- El cuerpo JSON se limita a 20 kb y se desactiva el encabezado `X-Powered-By`.
- Los errores inesperados no exponen stack, URI ni detalles internos al cliente.
- Si la conexión con MongoDB falla al arrancar, la API muestra un mensaje seguro (sin URI ni contraseña) y no abre el puerto.
- En Atlas, el usuario de base de datos tiene `readWrite` solo sobre `task_api` y la lista de acceso contiene únicamente la IP necesaria (no `0.0.0.0/0`).
- Al recibir `SIGINT` o `SIGTERM` (Ctrl+C), la API cierra primero el servidor HTTP y después la conexión con MongoDB.

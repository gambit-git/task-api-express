# Task API Express

API REST de gestión de tareas construida con Node.js, TypeScript y Express 5. Las tareas se guardan en MongoDB Atlas mediante Mongoose y permanecen disponibles después de reiniciar la API.

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

| Variable          | Descripción                             |
| ----------------- | --------------------------------------- |
| `PORT`            | Puerto del servidor (por defecto 3000)  |
| `MONGODB_URI`     | Cadena de conexión de Atlas (secreto)   |
| `MONGODB_DB_NAME` | Nombre de la base de datos (`task_api`) |

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
```

## Endpoints

| Método | Ruta                      | Descripción                                                                                                                                              |
| ------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`                 | Estado del servidor                                                                                                                                      |
| GET    | `/health/database`        | Ping a MongoDB (503 si no responde)                                                                                                                      |
| GET    | `/api/tasks`              | Lista paginada con filtro, búsqueda y orden (ver [Consulta del listado](#consulta-del-listado)); responde `{ "data": [...], "meta": {...} }`             |
| GET    | `/api/tasks/:id`          | Consulta una tarea                                                                                                                                       |
| POST   | `/api/tasks`              | Crea una tarea (`{"title": "...", "description": "...", "priority": "high"}`; `description` y `priority` son opcionales)                                 |
| PATCH  | `/api/tasks/:id`          | Actualización parcial: `title`, `status` (`pending` o `completed`), `priority` o varios a la vez. Rechaza cuerpos vacíos, arreglos y campos desconocidos |
| PATCH  | `/api/tasks/:id/complete` | Marca la tarea como completada                                                                                                                           |
| PATCH  | `/api/tasks/:id/status`   | Actualiza el estado (`{"completed": true}`)                                                                                                              |
| DELETE | `/api/tasks/:id`          | Elimina una tarea                                                                                                                                        |

Cada respuesta incluye el encabezado `X-Request-Id`. Los errores usan los códigos `INVALID_ID`, `INVALID_JSON`, `TASK_NOT_FOUND`, `ROUTE_NOT_FOUND`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR`, `QUERY_VALIDATION_ERROR`, `PERSISTENCE_VALIDATION_ERROR`, `DATABASE_UNAVAILABLE` e `INTERNAL_ERROR`.

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
  middlewares/   request id, validaciones (incluida la consulta del listado), notFound y errorHandler
  models/        modelo de Mongoose y tipos (Task, TaskPersistence, TaskUpdate)
  repositories/  único acceso a Mongoose: filtros, orden, paginación y operaciones CRUD
  routes/        rutas de tareas y de salud
  services/      reglas de negocio y respuesta pública (meta de paginación)
  types/         contratos tipados (errores y consulta del listado)
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

## Documentación de las actividades

- `docs/pruebas-conexion-mongodb.md` y `docs/reflexion-mongodb.md` (A5)
- `docs/pruebas-persistencia-mongodb.md` y `docs/reflexion-modelado-mongodb.md` (A6)
- `postman/postman_collections/Task-API-EC2-F2-A6.postman_collection.json`: carpeta **EC2 F2 A6 Persistencia**
- `docs/pruebas-crud-mongodb.md` y `docs/reflexion-crud-mongodb.md` (A7)
- `postman/postman_collections/Task-API-EC2-F2-A7.postman_collection.json`: carpeta **EC2 F2 A7 CRUD**
- `docs/pruebas-consultas-tareas.md` y `docs/reflexion-consultas-tareas.md` (A8)
- `postman/postman_collections/Task-API-EC2-F3-A8.postman_collection.json`: carpeta **EC2 F3 A8 Consultas**

## Seguridad

- `.env` está en `.gitignore`; `.env.example` no contiene secretos.
- Los errores inesperados no exponen stack, URI ni detalles internos al cliente.
- Si la conexión con MongoDB falla al arrancar, la API muestra un mensaje seguro (sin URI ni contraseña) y no abre el puerto.
- En Atlas, el usuario de base de datos tiene `readWrite` solo sobre `task_api` y la lista de acceso contiene únicamente la IP necesaria (no `0.0.0.0/0`).
- Al recibir `SIGINT` o `SIGTERM` (Ctrl+C), la API cierra primero el servidor HTTP y después la conexión con MongoDB.

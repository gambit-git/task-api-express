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

| Método | Ruta                      | Descripción                                 |
| ------ | ------------------------- | ------------------------------------------- |
| GET    | `/health`                 | Estado del servidor                         |
| GET    | `/health/database`        | Ping a MongoDB (503 si no responde)         |
| GET    | `/api/tasks`              | Lista las tareas                            |
| GET    | `/api/tasks/:id`          | Consulta una tarea                          |
| POST   | `/api/tasks`              | Crea una tarea (`{"title": "...", "description": "..."}`; la descripción es opcional, máx. 300) |
| PATCH  | `/api/tasks/:id`          | Edita el título                             |
| PATCH  | `/api/tasks/:id/complete` | Marca la tarea como completada              |
| PATCH  | `/api/tasks/:id/status`   | Actualiza el estado (`{"completed": true}`) |
| DELETE | `/api/tasks/:id`          | Elimina una tarea                           |

Cada respuesta incluye el encabezado `X-Request-Id`. Los errores usan los códigos `INVALID_ID`, `INVALID_JSON`, `TASK_NOT_FOUND`, `ROUTE_NOT_FOUND`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR`, `PERSISTENCE_VALIDATION_ERROR`, `DATABASE_UNAVAILABLE` e `INTERNAL_ERROR`.

## Estructura

```text
src/
  config/        configuración de entorno y conexión a MongoDB
  controllers/   traducen HTTP a llamadas al servicio
  errors/        AppError
  middlewares/   request id, validaciones, notFound y errorHandler
  models/        modelo de Mongoose y tipos (Task, TaskPersistence)
  routes/        rutas de tareas y de salud
  services/      reglas de negocio
  utils/         utilidades
  app.ts         configura Express
  server.ts      conecta a la base de datos y abre el puerto
docs/            pruebas y reflexiones
postman/         colecciones de Postman
tests/           pruebas del modelo y los middlewares
```

## Modelo de datos

Colección `tasks` en la base `task_api`:

| Campo         | Regla                                                  |
| ------------- | ------------------------------------------------------ |
| `title`       | obligatorio, `trim`, máximo 120 caracteres             |
| `description` | opcional, `trim`, máximo 300 caracteres                |
| `status`      | `pending` (predeterminado) o `completed`               |
| `createdAt`   | automático (`timestamps`)                              |
| `updatedAt`   | automático (`timestamps`)                              |

`versionKey` está desactivado. La API devuelve `id` (string) en lugar de `_id` y nunca expone `__v`. Un id que no sea un ObjectId de 24 caracteres hexadecimales produce `400 INVALID_ID`.

## Documentación de las actividades

- `docs/pruebas-conexion-mongodb.md` y `docs/reflexion-mongodb.md` (A5)
- `docs/pruebas-persistencia-mongodb.md` y `docs/reflexion-modelado-mongodb.md` (A6)
- `postman/Task-API-EC2-F2-A6.postman_collection.json`: carpeta **EC2 F2 A6 Persistencia**

## Seguridad

- `.env` está en `.gitignore`; `.env.example` no contiene secretos.
- Los errores inesperados no exponen stack, URI ni detalles internos al cliente.
- Si la conexión con MongoDB falla al arrancar, la API muestra un mensaje seguro (sin URI ni contraseña) y no abre el puerto.
- En Atlas, el usuario de base de datos tiene `readWrite` solo sobre `task_api` y la lista de acceso contiene únicamente la IP necesaria (no `0.0.0.0/0`).
- Al recibir `SIGINT` o `SIGTERM` (Ctrl+C), la API cierra primero el servidor HTTP y después la conexión con MongoDB.

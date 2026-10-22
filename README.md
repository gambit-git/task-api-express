# Task API Express

API REST de gestión de tareas construida con Node.js, TypeScript y Express 5. Las tareas se guardan en un arreglo en memoria (se reinician al reiniciar el servidor). El proyecto incluye la configuración de conexión con MongoDB Atlas mediante Mongoose, usada por ahora solo para diagnóstico de salud.

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
pnpm test          # pruebas del servicio
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
| POST   | `/api/tasks`              | Crea una tarea (`{"title": "..."}`)         |
| PATCH  | `/api/tasks/:id`          | Edita el título                             |
| PATCH  | `/api/tasks/:id/complete` | Marca la tarea como completada              |
| PATCH  | `/api/tasks/:id/status`   | Actualiza el estado (`{"completed": true}`) |
| DELETE | `/api/tasks/:id`          | Elimina una tarea                           |

Cada respuesta incluye el encabezado `X-Request-Id`. Los errores usan los códigos `INVALID_ID`, `INVALID_JSON`, `TASK_NOT_FOUND`, `ROUTE_NOT_FOUND`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR`, `DATABASE_UNAVAILABLE` e `INTERNAL_ERROR`.

## Estructura

```text
src/
  config/        configuración de entorno y conexión a MongoDB
  controllers/   traducen HTTP a llamadas al servicio
  data/          datos temporales en memoria
  errors/        AppError
  middlewares/   request id, validaciones, notFound y errorHandler
  models/        tipos (Task)
  routes/        rutas de tareas y de salud
  services/      reglas de negocio
  utils/         utilidades
  app.ts         configura Express
  server.ts      conecta a la base de datos y abre el puerto
docs/            pruebas y reflexiones
postman/         colecciones de Postman
tests/           pruebas del servicio
```

## Seguridad

- `.env` está en `.gitignore`; `.env.example` no contiene secretos.
- Los errores inesperados no exponen stack, URI ni detalles internos al cliente.
- Si la conexión con MongoDB falla al arrancar, la API muestra un mensaje seguro (sin URI ni contraseña) y no abre el puerto.
- En Atlas, el usuario de base de datos tiene `readWrite` solo sobre `task_api` y la lista de acceso contiene únicamente la IP necesaria (no `0.0.0.0/0`).
- Al recibir `SIGINT` o `SIGTERM` (Ctrl+C), la API cierra primero el servidor HTTP y después la conexión con MongoDB.

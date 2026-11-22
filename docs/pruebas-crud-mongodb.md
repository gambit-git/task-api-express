# Pruebas del CRUD persistente

Actividad EC2 F2 A7. No se incluyen la URI, el usuario, la contraseña, el host ni capturas que los muestren.

## Entorno

- Rama: `feature/crud-persistente-completo`
- Base: `task_api`
- Colección: `tasks`
- Mongoose: 8.24.5 (la versión ya usada y probada en A6; el enunciado menciona 8.24.4)
- Las pruebas HTTP se ejecutaron el 2026-11-21 (las marcas de tiempo del servidor están en UTC, 2026-11-22) con `curl` sobre la API compilada (`node dist/server.js`) conectada a Atlas.
- `pnpm check`: sin errores
- `pnpm lint`: sin errores
- `pnpm test`: 8 pruebas aprobadas, 0 fallidas (modelo, `priority`, `validatePriority`, `validateTaskUpdate`, `validateId` y `validateDescription`)
- `pnpm build`: sin errores; `dist/middlewares/validate-task-update.middleware.js` existe
- `GET /health`: 200; `GET /health/database`: 200 `connected`
- `git check-ignore .env`: `.env` está ignorado; `git ls-files .env`: vacío

## Colección de Postman

Importar `postman/Task-API-EC2-F2-A7.postman_collection.json`. Contiene la carpeta **EC2 F2 A7 CRUD** con las subcarpetas **Positivas**, **Negativas** y **Desafio priority**. Define `baseUrl`, guarda el id devuelto por POST en `taskId` y cada solicitud trae pruebas automáticas del código HTTP.

Las solicitudes de las tablas siguientes se ejecutaron con `curl`, con los mismos métodos, rutas y cuerpos que la colección. La colección se creó a partir de ellas y todavía no se ha corrido dentro de la aplicación Postman.

## Recurso de prueba

- id devuelto por POST: `6b0245c2f86dc8073b1a3f51`
- title inicial: `A7 evidencia CRUD`
- title final: `Revisar evidencias`
- status final: `completed` (tras `PATCH /complete`)
- `createdAt` se mantuvo igual en todas las actualizaciones y `updatedAt` cambió en cada una.
- Persistencia después de reiniciar: aprobada (ver casos 27 y 28)

## Casos ejecutados

Las respuestas exitosas no repiten el `requestId` en el cuerpo (viaja en el encabezado `X-Request-Id`), por eso aparece `—`. En los errores el `requestId` sale en el cuerpo.

| #   | Tipo      | Método y ruta                              | Datos                                               | Esperado                     | Obtenido                                                               | requestId                              | Resultado |
| --- | --------- | ------------------------------------------ | --------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- | -------------------------------------- | --------- |
| 1   | Positiva  | POST /api/tasks                            | `{"title":"A7 evidencia CRUD"}`                     | 201 pending                  | 201, `status` pending, sin `_id` ni `__v`                              | —                                      | Aprobada  |
| 2   | Positiva  | GET /api/tasks                             | No aplica                                           | 200 con la tarea             | 200, `data` es un arreglo que incluye la tarea                         | —                                      | Aprobada  |
| 3   | Positiva  | GET /api/tasks/:id                         | No aplica                                           | 200 mismo recurso            | 200, mismo `id`, `title` y `status`                                    | —                                      | Aprobada  |
| 4   | Positiva  | PATCH /api/tasks/:id                       | `{"title":"Documentar el CRUD persistente"}`        | 200, `status` se conserva    | 200, título nuevo, `status` pending, `updatedAt` cambió                | —                                      | Aprobada  |
| 5   | Positiva  | PATCH /api/tasks/:id                       | `{"status":"completed"}`                            | 200, `title` se conserva     | 200, `status` completed, el título anterior se conservó                | —                                      | Aprobada  |
| 6   | Positiva  | PATCH /api/tasks/:id                       | `{"title":"Revisar evidencias","status":"pending"}` | 200 ambos cambian            | 200, ambos campos cambiaron, `createdAt` igual y `updatedAt` posterior | —                                      | Aprobada  |
| 7   | Regresión | PATCH /api/tasks/:id/complete              | sin cuerpo                                          | 200 completed                | 200, `status` completed (sin exigir JSON)                              | —                                      | Aprobada  |
| 8   | Regresión | GET /api/tasks/:id                         | No aplica                                           | 200 completed                | 200, `status` completed                                                | —                                      | Aprobada  |
| 9   | Positiva  | DELETE /api/tasks/:id                      | No aplica                                           | 204 sin cuerpo               | 204, cuerpo vacío                                                      | —                                      | Aprobada  |
| 10  | Positiva  | GET /api/tasks/:id (tras eliminar)         | No aplica                                           | 404 TASK_NOT_FOUND           | 404 `TASK_NOT_FOUND`                                                   | `2d06a062-eca7-473f-b610-1462188c26e3` | Aprobada  |
| 11  | Negativa  | PATCH /api/tasks/1                         | `{"title":"x"}`                                     | 400 INVALID_ID               | 400 `INVALID_ID`                                                       | `95c953f7-6a24-4a21-a1d1-7f1cf18d1e37` | Aprobada  |
| 12  | Negativa  | PATCH /api/tasks/64b7f0c2a1b2c3d4e5f60718  | `{"title":"x"}`                                     | 404 TASK_NOT_FOUND           | 404 `TASK_NOT_FOUND`                                                   | `0e5c4b78-d62f-4d83-b547-aeefc9f8b672` | Aprobada  |
| 13  | Negativa  | PATCH /api/tasks/:id                       | Content-Type `text/plain`                           | 415 UNSUPPORTED_MEDIA_TYPE   | 415 `UNSUPPORTED_MEDIA_TYPE`                                           | `9a55d052-e33b-4cd6-9563-11074c51c6d9` | Aprobada  |
| 14  | Negativa  | PATCH /api/tasks/:id                       | JSON mal formado `{"title":`                        | 400 INVALID_JSON             | 400 `INVALID_JSON`                                                     | `c1aa36ad-b6ad-438b-b680-7a67423166b8` | Aprobada  |
| 15  | Negativa  | PATCH /api/tasks/:id                       | `{}`                                                | 422 VALIDATION_ERROR         | 422, detalle `body`: "Incluye al menos title, status o priority."      | `8fd77eb6-586a-444b-8a14-9487e30925ef` | Aprobada  |
| 16  | Negativa  | PATCH /api/tasks/:id                       | `[1,2]`                                             | 422 VALIDATION_ERROR         | 422, detalle `body`: "Debe ser un objeto JSON."                        | `2220e63f-cf4a-4581-8804-f10a6688166d` | Aprobada  |
| 17  | Negativa  | PATCH /api/tasks/:id                       | `{"title":" "}`                                     | 422 VALIDATION_ERROR         | 422, detalle `title`: "Debe ser texto no vacío."                       | `530f9cc3-139e-45d6-aa35-e550edeec384` | Aprobada  |
| 18  | Negativa  | PATCH /api/tasks/:id                       | título de 121 caracteres                            | 422 VALIDATION_ERROR         | 422, detalle `title`: "No debe superar 120 caracteres."                | `9921e51f-e8a9-4746-bd94-4175d24dcbb4` | Aprobada  |
| 19  | Negativa  | PATCH /api/tasks/:id                       | `{"status":"archived"}`                             | 422 VALIDATION_ERROR         | 422, detalle `status`: "Debe ser pending o completed."                 | `d0621d96-04c9-4965-a07c-67179f369c40` | Aprobada  |
| 20  | Negativa  | PATCH /api/tasks/:id                       | `{"owner":"Ana"}`                                   | 422 e identifica `owner`     | 422, detalle `owner`: "El campo no está permitido."                    | `28dd6572-6a74-49c0-8974-343b4a703a7c` | Aprobada  |
| 21  | Negativa  | PATCH /api/tasks/:id                       | `{"createdAt":"2026-01-01"}`                        | 422 e identifica `createdAt` | 422, detalle `createdAt`: "El campo no está permitido."                | `454efb25-2689-4f35-8e3b-f9c5d4810e3e` | Aprobada  |
| 22  | Negativa  | DELETE /api/tasks/64b7f0c2a1b2c3d4e5f60718 | No aplica                                           | 404 TASK_NOT_FOUND           | 404 `TASK_NOT_FOUND`                                                   | `1cce1b57-6f0e-4c4e-b57b-a663f2dbdab5` | Aprobada  |
| 23  | Regresión | GET /api/inexistente                       | No aplica                                           | 404 ROUTE_NOT_FOUND          | 404 `ROUTE_NOT_FOUND`                                                  | `67c20ffc-1dc9-4042-9b2e-16e4c7527d04` | Aprobada  |
| 24  | Negativa  | GET /api/tasks                             | Atlas no disponible                                 | 503 DATABASE_UNAVAILABLE     | No ejecutada: no se cortó la conexión con Atlas durante las pruebas    | —                                      | Pendiente |

## Persistencia

Se creó la tarea `6b0245c5f86dc8073b1a3f5c` con título `A7 negativos`, se actualizó su título a `Persistente tras reinicio`, se detuvo la API (puerto 3000 cerrado) y se inició de nuevo.

| #   | Tipo         | Método y ruta                                | Esperado                      | Obtenido                                                                | requestId                              | Resultado |
| --- | ------------ | -------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- | -------------------------------------- | --------- |
| 25  | Persistencia | PATCH /api/tasks/:id antes del reinicio      | 200 título nuevo              | 200, título `Persistente tras reinicio`                                 | —                                      | Aprobada  |
| 26  | Persistencia | GET /health tras el reinicio                 | 200                           | 200                                                                     | —                                      | Aprobada  |
| 27  | Persistencia | GET /api/tasks/:id tras el reinicio          | 200 con el título actualizado | 200, mismo `id`, título `Persistente tras reinicio` y mismo `updatedAt` | —                                      | Aprobada  |
| 28  | Persistencia | DELETE y GET /api/tasks/:id tras el reinicio | 204 y luego 404               | 204; después 404 `TASK_NOT_FOUND`                                       | `8cd8212b-2b6a-40a8-b384-305ee188713c` | Aprobada  |

## Desafío priority

| #   | Tipo         | Método y ruta                                     | Datos                                              | Esperado                      | Obtenido                                                    | requestId                              | Resultado |
| --- | ------------ | ------------------------------------------------- | -------------------------------------------------- | ----------------------------- | ----------------------------------------------------------- | -------------------------------------- | --------- |
| 29  | Desafío      | POST /api/tasks                                   | `{"title":"A7 priority default"}`                  | 201 `priority` medium         | 201, `priority` medium                                      | —                                      | Aprobada  |
| 30  | Desafío      | POST /api/tasks                                   | `priority` high                                    | 201 `priority` high           | 201, `priority` high                                        | —                                      | Aprobada  |
| 31  | Desafío      | POST /api/tasks                                   | `{"title":"A7 x","priority":"urgent"}`             | 422 con detalle en `priority` | 422, detalle `priority`: "Debe ser low, medium o high."     | `8d8c5ba7-1929-4bb6-8c3c-afac1e19c04b` | Aprobada  |
| 32  | Desafío      | PATCH /api/tasks/:id                              | `{"priority":"low"}`                               | 200 `priority` low            | 200, `priority` low, el resto de campos intacto             | —                                      | Aprobada  |
| 33  | Desafío      | PATCH /api/tasks/:id                              | `{"priority":"urgent"}`                            | 422 con detalle en `priority` | 422, detalle `priority`                                     | `147d6d1f-5d97-497d-aa58-675ac4ff9e65` | Aprobada  |
| 34  | Desafío      | PATCH /api/tasks/:id                              | `{"title":"A7 default editado","priority":"high"}` | 200 ambos cambian             | 200, título y `priority` actualizados                       | —                                      | Aprobada  |
| 35  | Desafío      | GET /api/tasks (documentos anteriores a priority) | No aplica                                          | `priority` medium sin romper  | 200, las tareas creadas en A6 se leen con `priority` medium | —                                      | Aprobada  |
| 36  | Persistencia | GET /api/tasks/:id tras reiniciar la API          | No aplica                                          | `priority` conservado         | 200, `priority` high en una tarea y low en la otra          | —                                      | Aprobada  |

Después de las pruebas se eliminaron todas las tareas creadas (DELETE 204) y una consulta posterior confirmó que no quedó ninguna tarea de prueba en la colección.

## Archivos modificados por el desafío

| Archivo                                              | Cambio                                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/models/task.ts`                                 | `TASK_PRIORITIES`, `TaskPriority`, `priority` en `TaskPersistence`, `Task`, `TaskUpdate` y el esquema (`enum`, `default: "medium"`) |
| `src/middlewares/validate-priority.middleware.ts`    | Nuevo. Valida `priority` opcional en POST y deja el valor en `res.locals.priority`                                                  |
| `src/middlewares/validate-task-update.middleware.ts` | Permite `priority` como tercer campo y lo valida                                                                                    |
| `src/services/task.service.ts`                       | `toTask` devuelve `priority`; `createTask` recibe `priority` opcional                                                               |
| `src/controllers/task.controller.ts`                 | `postTask` pasa `priority` al servicio                                                                                              |
| `src/routes/task.routes.ts`                          | Agrega `validatePriority` a POST. No se creó ninguna ruta nueva                                                                     |
| `tests/task.services.test.ts`                        | 3 pruebas nuevas                                                                                                                    |

## Evidencias

1. Compilación correcta: `pnpm check`, `pnpm lint`, `pnpm test` y `pnpm build` sin errores.
2. Respuestas de `PATCH` con el documento antes y después: ver los casos 4, 5 y 6.
3. Respuesta 204 sin cuerpo: caso 9.
4. Error de validación con `requestId`: casos 15 a 21.
5. Consulta después de reiniciar: casos 27 y 36.
6. Capturas de Postman y de Atlas Data Explorer: pendientes de agregar por quien entrega la actividad. Deben ocultar la URI, el usuario, la contraseña y el host.

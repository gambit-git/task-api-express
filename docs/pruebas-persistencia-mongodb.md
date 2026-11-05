# Pruebas de persistencia con MongoDB Atlas

Actividad EC2 F2 A6. No se incluyen la URI, el usuario, la contraseña, el host ni capturas que los muestren.

## Entorno

- Rama de la actividad: `feature/modelo-tareas-mongodb`
- Las pruebas HTTP se ejecutaron el 2026-11-05 sobre la rama `feature/crud-persistente-completo`, que conserva sin cambios las rutas, los códigos y los errores de A6.
- Base de datos: `task_api`
- Colección: `tasks`
- `pnpm check`: sin errores
- `pnpm lint`: sin errores
- `pnpm test`: 9 pruebas aprobadas, 0 fallidas (modelo, `validateId`, `validateDescription`, `validateTaskUpdate` y `validatePriority`)
- `pnpm build`: sin errores
- `git ls-files .env`: vacío; `git check-ignore .env`: `.env` está ignorado

## Colección de Postman

Importar `postman/Task-API-EC2-F2-A6.postman_collection.json`. Contiene la carpeta **EC2 F2 A6 Persistencia**: guarda el id en la variable `taskId` y lo usa mediante `{{taskId}}`. Cada solicitud tiene pruebas automáticas del código HTTP.

## Tabla de pruebas

| #   | Tipo            | Método y ruta                                      | Datos                               | Esperado                                             | Obtenido                                                                                                                                              | requestId                              | Resultado |
| --- | --------------- | -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------- |
| 1   | Positiva        | GET /health/database                               | No aplica                           | 200 connected                                        | 200 `database.status` = `connected`                                                                                                                   | `460d5106-7e2a-4cb0-850a-a192e699a3ad` | Aprobada  |
| 2   | Positiva        | POST /api/tasks                                    | título y descripción                | 201, `id` string de 24 hex, sin `_id` ni `__v`       | 201, `id` de 24 hex, `status` pending, sin `_id` ni `__v`                                                                                             | `e4d72d09-903d-4b91-9449-91d451277d21` | Aprobada  |
| 3   | Positiva        | GET /api/tasks                                     | No aplica                           | 200                                                  | 200, `data` es un arreglo ordenado por `createdAt`                                                                                                    | `63c710a3-4600-40a0-88e2-10f5a89bba84` | Aprobada  |
| 4   | Positiva        | GET /api/tasks/{{taskId}}                          | No aplica                           | 200                                                  | 200, mismo `id`, `title` y `description` que en la creación                                                                                           | `88ca68a7-cf00-4ffd-877c-13b9069dc6c4` | Aprobada  |
| 5   | Positiva        | PATCH /api/tasks/{{taskId}}/complete               | No aplica                           | 200 completed                                        | 200, `status` completed, `updatedAt` cambió                                                                                                           | `a70e1414-9b59-4448-8913-bff3f6c5556d` | Aprobada  |
| 6   | Positiva        | GET /api/tasks/{{taskId}}                          | No aplica                           | 200 completed                                        | 200, `status` completed                                                                                                                               | `dc21067d-bd32-46ad-b1ee-25de340c794e` | Aprobada  |
| 7   | Desafío         | POST /api/tasks                                    | solo título                         | 201 sin `description`                                | 201, la respuesta no incluye `description`                                                                                                            | `49fff2d6-49e9-45f4-87d0-42556f2dea2a` | Aprobada  |
| 8   | Positiva        | DELETE /api/tasks/{{taskId}}                       | No aplica                           | 204                                                  | 204 sin cuerpo (ejecutada después de la prueba 16)                                                                                                    | `52d065c6-f658-40dd-889d-4e0445202e58` | Aprobada  |
| 9   | Negativa        | GET /api/tasks/{{taskId}}                          | No aplica                           | 404 TASK_NOT_FOUND                                   | 404 `TASK_NOT_FOUND`                                                                                                                                  | `14b1da7b-4a9c-4577-9064-2a7892a46b15` | Aprobada  |
| 10  | Negativa        | GET /api/tasks/abc                                 | No aplica                           | 400 INVALID_ID                                       | 400 `INVALID_ID`                                                                                                                                      | `194d114a-3428-4ed3-bbc7-88ccfe2aaacd` | Aprobada  |
| 11  | Negativa        | GET /api/tasks/507f1f77bcf86cd799439011            | No aplica                           | 404 TASK_NOT_FOUND                                   | 404 `TASK_NOT_FOUND`                                                                                                                                  | `8f74ed0c-4c91-4fd9-8f0d-8c549da68ae2` | Aprobada  |
| 12  | Negativa        | POST /api/tasks                                    | `{"title":""}`                      | 422 VALIDATION_ERROR                                 | 422 `VALIDATION_ERROR`, detalle en `title`                                                                                                            | `9b147ed1-700d-4338-b50f-8f31594cfacf` | Aprobada  |
| 13  | Negativa        | POST /api/tasks                                    | título de 121 caracteres            | 422 VALIDATION_ERROR                                 | 422 `VALIDATION_ERROR`, "No debe superar 120 caracteres."                                                                                             | `8044e90a-66ab-41bb-9bfa-f79b73e082cd` | Aprobada  |
| 14  | Negativa        | POST /api/tasks                                    | raw Text                            | 415 UNSUPPORTED_MEDIA_TYPE                           | 415 `UNSUPPORTED_MEDIA_TYPE`                                                                                                                          | `ad9513d7-0316-4168-a522-b461040727d4` | Aprobada  |
| 15  | Desafío         | POST /api/tasks                                    | descripción de 301 caracteres       | 422 VALIDATION_ERROR                                 | 422 `VALIDATION_ERROR`, detalle en `description`                                                                                                      | `f4fd5fe8-2c31-427f-82e7-275ee9b1a2ea` | Aprobada  |
| 16  | Persistencia    | GET /api/tasks/:id tras detener y reiniciar la API | tarea con descripción creada antes  | 200 con los mismos datos                             | 200 con el mismo `id`, `title`, `description` y `status`                                                                                              | `1c2b8f16-ddb1-49ff-81d3-f8e68459de8b` | Aprobada  |
| 17  | Regresión       | GET /api/tasks/1                                   | No aplica                           | 400 INVALID_ID                                       | 400 `INVALID_ID` (el id numérico de EC1 ya no es válido)                                                                                              | `350e4969-c8fb-4e53-8088-3b472134345e` | Aprobada  |
| 18  | Regresión       | GET /ruta-inexistente                              | No aplica                           | 404 ROUTE_NOT_FOUND                                  | 404 `ROUTE_NOT_FOUND`                                                                                                                                 | `140f4700-cbd5-4b01-b61e-69c8493a44b5` | Aprobada  |
| 19  | Infraestructura | Arranque con contraseña incorrecta                 | Contraseña alterada solo en memoria | La API no abre el puerto y muestra un mensaje seguro | Código de salida 1, el puerto 3000 no responde, mensaje: "No fue posible iniciar la API. Revise MONGODB_URI, el usuario y la lista de acceso de red." | No aplica (no hubo solicitud HTTP)     | Aprobada  |

Observaciones:

- En la prueba 19 la contraseña se alteró solo en la variable de entorno del proceso de prueba; el archivo `.env` no se modificó. La salida no contenía la URI, el host, la contraseña ni un stack trace.
- La prueba 7 creó una segunda tarea sin descripción. Se eliminó de inmediato: DELETE respondió 204 (`0b866ef8-188e-4884-9f80-832f182dc916`) y la consulta posterior respondió 404 `TASK_NOT_FOUND` (`07905762-e724-4405-83f0-122b4063b6b7`).
- Las respuestas de las pruebas 2 a 7 también incluyen `priority`, un campo de la actividad siguiente que no altera el contrato de A6.

Id utilizado en la prueba de persistencia: `6aec9f3a4e6a7d91b218d5f0`

## Comprobación del reinicio

1. Se creó una tarea con título y descripción (id `6aec9f3a4e6a7d91b218d5f0`) y se completó con PATCH `/complete`.
2. Se detuvo la API por completo y se confirmó que el puerto 3000 ya no respondía.
3. Se inició de nuevo y apareció "Conexión con MongoDB establecida."
4. `GET /api/tasks/6aec9f3a4e6a7d91b218d5f0` respondió 200 con el mismo título, la misma descripción, `status` completed y las mismas fechas `createdAt` y `updatedAt`.
5. Se eliminó la tarea (204) y la consulta posterior respondió 404 `TASK_NOT_FOUND`.

Resultado: la tarea sobrevivió al reinicio del proceso de Node.js, por lo que los datos están en Atlas y no en memoria.

## Capturas

Pendientes (las toma la persona que entrega): Postman con la carpeta completa en verde y el documento en la colección `tasks` de Atlas, sin credenciales visibles.

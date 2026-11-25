# Pruebas de persistencia con MongoDB Atlas

Actividad EC2 F2 A6. No se incluyen la URI, el usuario, la contraseña, el host ni capturas que los muestren.

## Entorno

- Rama: `feature/modelo-tareas-mongodb`
- Las pruebas HTTP se ejecutaron el 2026-11-11 sobre esta misma rama.
- Base de datos: `task_api`
- Colección: `tasks`
- `pnpm check`: sin errores
- `pnpm lint`: sin errores
- `pnpm test`: 5 pruebas aprobadas, 0 fallidas (modelo, `validateId` y `validateDescription`)
- `pnpm build`: sin errores
- `git ls-files .env`: vacío; `git check-ignore .env`: `.env` está ignorado

## Colección de Postman

Importar `postman/postman_collections/Task-API-EC2-F2-A6.postman_collection.json`. Contiene la carpeta **EC2 F2 A6 Persistencia**: guarda el id en la variable `taskId` y lo usa mediante `{{taskId}}`. Cada solicitud tiene pruebas automáticas del código HTTP.

## Tabla de pruebas

| #   | Tipo            | Método y ruta                                      | Datos                               | Esperado                                             | Obtenido                                                                                                                                              | requestId                              | Resultado |
| --- | --------------- | -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------- |
| 1   | Positiva        | GET /health/database                               | No aplica                           | 200 connected                                        | 200 `database.status` = `connected`                                                                                                                   | `150dcc7c-5ad2-4eb2-a42c-0c061f2bf439` | Aprobada  |
| 2   | Positiva        | POST /api/tasks                                    | título y descripción                | 201, `id` string de 24 hex, sin `_id` ni `__v`       | 201, `id` de 24 hex, `status` pending, sin `_id` ni `__v`                                                                                             | `41bbdfb6-b8c6-462c-83dc-24dbfc37bec0` | Aprobada  |
| 3   | Positiva        | GET /api/tasks                                     | No aplica                           | 200                                                  | 200, `data` es un arreglo ordenado por `createdAt`                                                                                                    | `de2c43d0-0f24-4f01-8f55-4fd1ad03a271` | Aprobada  |
| 4   | Positiva        | GET /api/tasks/{{taskId}}                          | No aplica                           | 200                                                  | 200, mismo `id`, `title` y `description` que en la creación                                                                                           | `7c95c029-d56f-42ff-913e-904027d8c9e9` | Aprobada  |
| 5   | Positiva        | PATCH /api/tasks/{{taskId}}/complete               | No aplica                           | 200 completed                                        | 200, `status` completed, `updatedAt` cambió                                                                                                           | `e400c0b8-86c3-4ab3-b48e-faa98a84889f` | Aprobada  |
| 6   | Positiva        | GET /api/tasks/{{taskId}}                          | No aplica                           | 200 completed                                        | 200, `status` completed                                                                                                                               | `5cef3e1b-5945-4c4f-9e9e-2d51be6e68ae` | Aprobada  |
| 7   | Desafío         | POST /api/tasks                                    | solo título                         | 201 sin `description`                                | 201, la respuesta no incluye `description`                                                                                                            | `59bdfa0d-a575-44aa-af1f-075a1cb7160d` | Aprobada  |
| 8   | Positiva        | DELETE /api/tasks/{{taskId}}                       | No aplica                           | 204                                                  | 204 sin cuerpo (ejecutada después de la prueba 16)                                                                                                    | `2285b27e-80e3-4acd-ab14-244896645096` | Aprobada  |
| 9   | Negativa        | GET /api/tasks/{{taskId}}                          | No aplica                           | 404 TASK_NOT_FOUND                                   | 404 `TASK_NOT_FOUND`                                                                                                                                  | `e8ec5849-e443-4519-a395-8c1a920be4d8` | Aprobada  |
| 10  | Negativa        | GET /api/tasks/abc                                 | No aplica                           | 400 INVALID_ID                                       | 400 `INVALID_ID`                                                                                                                                      | `473c6b4c-668a-480d-8208-8eae2077b5f5` | Aprobada  |
| 11  | Negativa        | GET /api/tasks/507f1f77bcf86cd799439011            | No aplica                           | 404 TASK_NOT_FOUND                                   | 404 `TASK_NOT_FOUND`                                                                                                                                  | `27e2f600-a6ed-418a-9ead-40ccf5e1542a` | Aprobada  |
| 12  | Negativa        | POST /api/tasks                                    | `{"title":""}`                      | 422 VALIDATION_ERROR                                 | 422 `VALIDATION_ERROR`, detalle en `title`                                                                                                            | `f4ed55d8-c6a3-42e6-b92f-1490fee150e1` | Aprobada  |
| 13  | Negativa        | POST /api/tasks                                    | título de 121 caracteres            | 422 VALIDATION_ERROR                                 | 422 `VALIDATION_ERROR`, "No debe superar 120 caracteres."                                                                                             | `92ea4f59-4b00-43ef-a43e-5f3d8f2635b9` | Aprobada  |
| 14  | Negativa        | POST /api/tasks                                    | raw Text                            | 415 UNSUPPORTED_MEDIA_TYPE                           | 415 `UNSUPPORTED_MEDIA_TYPE`                                                                                                                          | `46fc0328-c621-4d50-bc52-841dec1a0f28` | Aprobada  |
| 15  | Desafío         | POST /api/tasks                                    | descripción de 301 caracteres       | 422 VALIDATION_ERROR                                 | 422 `VALIDATION_ERROR`, detalle en `description`                                                                                                      | `694f486c-bb1b-4182-b757-d38bc5a7be41` | Aprobada  |
| 16  | Persistencia    | GET /api/tasks/:id tras detener y reiniciar la API | tarea con descripción creada antes  | 200 con los mismos datos                             | 200 con el mismo `id`, `title`, `description` y `status`                                                                                              | `fa2bb971-fdbc-48df-8c54-051728ea4176` | Aprobada  |
| 17  | Regresión       | GET /api/tasks/1                                   | No aplica                           | 400 INVALID_ID                                       | 400 `INVALID_ID` (el id numérico de EC1 ya no es válido)                                                                                              | `b56eb9e6-392e-4643-b96b-2c98bfc0cf9e` | Aprobada  |
| 18  | Regresión       | GET /ruta-inexistente                              | No aplica                           | 404 ROUTE_NOT_FOUND                                  | 404 `ROUTE_NOT_FOUND`                                                                                                                                 | `c011cd05-bfa7-4094-aee6-cffccfa08209` | Aprobada  |
| 19  | Infraestructura | Arranque con contraseña incorrecta                 | Contraseña alterada solo en memoria | La API no abre el puerto y muestra un mensaje seguro | Código de salida 1, el puerto 3000 no responde, mensaje: "No fue posible iniciar la API. Revise MONGODB_URI, el usuario y la lista de acceso de red." | No aplica (no hubo solicitud HTTP)     | Aprobada  |
| 20  | Regresión       | POST /api/tasks                                    | JSON mal formado `{"title":`        | 400 INVALID_JSON                                     | 400 `INVALID_JSON`                                                                                                                                    | `9dede2ef-2cb2-4c55-8712-631c8f0df472` | Aprobada  |

Observaciones:

- La prueba 19 se ejecutó el 2026-11-05; `src/server.ts` y `src/config/` no cambiaron desde entonces. La contraseña se alteró solo en la variable de entorno del proceso de prueba; el archivo `.env` no se modificó. La salida no contenía la URI, el host, la contraseña ni un stack trace.
- La prueba 7 creó una segunda tarea sin descripción. Se eliminó de inmediato: DELETE respondió 204 (`b261ab9b-0854-4a3c-be3f-ed12657318d8`) y la consulta posterior respondió 404 `TASK_NOT_FOUND` (`1a83de9e-021f-42e8-a9ea-94c5f84cc4e1`).

Id utilizado en la prueba de persistencia: `6af528ece0a254dae336df16`

## Comprobación del reinicio

1. Se creó una tarea con título y descripción (id `6af528ece0a254dae336df16`) y se completó con PATCH `/complete`.
2. Se detuvo la API por completo y se confirmó que el puerto 3000 ya no respondía.
3. Se inició de nuevo y apareció "Conexión con MongoDB establecida."
4. `GET /api/tasks/6af528ece0a254dae336df16` respondió 200 con el mismo título, la misma descripción, `status` completed y las mismas fechas `createdAt` y `updatedAt`.
5. Se eliminó la tarea (204) y la consulta posterior respondió 404 `TASK_NOT_FOUND`.

Resultado: la tarea sobrevivió al reinicio del proceso de Node.js, por lo que los datos están en Atlas y no en memoria.

## Capturas

Pendientes (las toma la persona que entrega): Postman con la carpeta completa en verde y el documento en la colección `tasks` de Atlas, sin credenciales visibles.

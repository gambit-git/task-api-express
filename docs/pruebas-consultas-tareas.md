# Pruebas de consultas de tareas

Actividad EC2 F3 A8. No se incluyen la URI, el usuario, la contraseña, el host ni capturas que los muestren.

## Entorno

- Rama: `feature/consultas-paginadas`
- Base: `task_api`
- Colección: `tasks`
- Mongoose: 8.24.5 (la versión ya usada y probada en A6 y A7; el enunciado menciona 8.24.4). No se instalaron dependencias nuevas.
- Las pruebas HTTP se ejecutaron el 2026-11-21 (las marcas de tiempo del servidor están en UTC, 2026-11-22) con un script de Node que usa `fetch` contra la API compilada (`node dist/server.js`) conectada a Atlas. El script calcula el resultado esperado de cada consulta a partir de la lista completa de tareas y lo compara con la respuesta (ids, orden y `meta`).
- `pnpm check`: sin errores
- `pnpm lint`: sin errores
- `pnpm test`: 15 pruebas aprobadas, 0 fallidas
- `pnpm build`: sin errores; `dist/repositories/task.repository.js`, `dist/types/task-query.js` y `dist/middlewares/validate-task-query.middleware.js` existen
- `GET /health`: 200; `GET /health/database`: 200 `connected`
- `git check-ignore .env`: `.env` está ignorado; `git ls-files .env`: vacío

## Colección de Postman

Importar `postman/Task-API-EC2-F3-A8.postman_collection.json`. Contiene la carpeta **EC2 F3 A8 Consultas** con las subcarpetas **Datos de prueba**, **Positivas**, **Negativas**, **Desafio fechas**, **Regresion CRUD** y **Limpieza**. Las solicitudes de datos guardan los ids y las fechas de creación en variables de colección y la limpieza elimina esas cinco tareas. Cada solicitud trae pruebas automáticas sobre `data`, `meta` y el código HTTP.

Las solicitudes de las tablas siguientes se ejecutaron con el script de Node, con los mismos métodos, rutas y parámetros que la colección. La colección se creó a partir de ellas y todavía no se ha corrido dentro de la aplicación Postman.

## Datos preparados

La colección `tasks` ya tenía tareas de actividades anteriores, que no se tocaron ni se borraron. Los totales de las pruebas incluyen esas tareas.

| Momento                                              | Total de tareas | Tareas pending | Tareas completed |
| ---------------------------------------------------- | --------------: | -------------: | ---------------: |
| Antes de crear los datos                             |               7 |              7 |                0 |
| Con las 5 tareas de prueba (3 pending y 2 completed) |              12 |             10 |                2 |
| Después de la limpieza                               |               7 |              7 |                0 |

Tareas de prueba: Aprender Express, Documentar MongoDB (completed), Practicar búsqueda, Revisar API (completed) y Preparar entrega.

## Resultados

Total de casos listados: 77 (76 ejecutados contra Atlas y 1 simulada con mock). Aprobados: 77. Fallidos: 0.

Cada fila de listado se comparó contra el resultado esperado calculado localmente: mismos documentos, mismo orden y mismo `meta` (`page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage`), además de la ausencia de `_id` y `__v`. En los casos negativos se comprobó 422, `QUERY_VALIDATION_ERROR`, el campo en `details` y la presencia de `requestId`. El `requestId` de la tabla es el encabezado `X-Request-Id` de cada respuesta.

### Datos de prueba

| #   | Tipo  | Método y ruta                                          |    Esperado | Obtenido | requestId                              | Resultado |
| --- | ----- | ------------------------------------------------------ | ----------: | -------: | -------------------------------------- | --------- |
| 1   | Datos | `PATCH /api/tasks/:id Documentar MongoDB -> completed` |         200 |      200 | `22bddeae-d704-4e15-958c-db4283147835` | Aprobada  |
| 2   | Datos | `PATCH /api/tasks/:id Revisar API -> completed`        |         200 |      200 | `612c6e8b-5728-4b87-abdf-97def334e178` | Aprobada  |
| 3   | Datos | `Conjunto preparado (total, pending, completed)`       | 12 / 10 / 2 | 12 / 10 / 2 | —                                      | Aprobada  |

### Casos positivos (salud, paginación, filtro, búsqueda, orden y combinación)

| #   | Tipo     | Método y ruta                                                                        |    Esperado | Obtenido | requestId                              | Resultado |
| --- | -------- | ------------------------------------------------------------------------------------ | ----------: | -------: | -------------------------------------- | --------- |
| 4   | Positiva | `GET /health`                                                                        |         200 |      200 | `88d53c42-7cc8-48b5-8860-1fa382c31847` | Aprobada  |
| 5   | Positiva | `GET /health/database`                                                               |         200 |      200 | `13b02833-21ab-4528-82fe-c71dfca7e2eb` | Aprobada  |
| 6   | Positiva | `GET /api/tasks (sin parámetros)`                                                    |         200 |      200 | `0ae51304-a7e2-4224-95f6-01067031b250` | Aprobada  |
| 7   | Positiva | `GET /api/tasks?page=1&limit=2`                                                      |         200 |      200 | `c787599f-a7f2-4091-9e0d-dffb3b1bf7d1` | Aprobada  |
| 8   | Positiva | `GET /api/tasks?page=2&limit=2`                                                      |         200 |      200 | `209456f1-4b6f-4d6d-a45e-d1c6cd680847` | Aprobada  |
| 9   | Positiva | `páginas 1 y 2 sin documentos repetidos`                                             | 0 repetidos |      200 | —                                      | Aprobada  |
| 10  | Positiva | `GET /api/tasks?page=9999&limit=2`                                                   |         200 |      200 | `6fbd093d-32d4-4697-89f8-1b60c934977e` | Aprobada  |
| 11  | Positiva | `GET /api/tasks?status=completed`                                                    |         200 |      200 | `89d6777e-f170-4362-909b-45abfde0294a` | Aprobada  |
| 12  | Positiva | `GET /api/tasks?status=pending`                                                      |         200 |      200 | `7b2a1c4f-ecbf-41ab-b786-315b1d97c87f` | Aprobada  |
| 13  | Positiva | `GET /api/tasks?search=api`                                                          |         200 |      200 | `e492692e-cf8c-41dd-b9a2-25a003ab6047` | Aprobada  |
| 14  | Positiva | `GET /api/tasks?search=MONGODB`                                                      |         200 |      200 | `ae47d017-c710-4402-b2d6-b43e522f87d8` | Aprobada  |
| 15  | Positiva | `GET /api/tasks?search=.*`                                                           |         200 |      200 | `54f8ff3b-8c7a-49aa-85ba-c338d1e0d984` | Aprobada  |
| 16  | Positiva | `GET /api/tasks?search=%28`                                                          |         200 |      200 | `0a7464ad-f5fd-493e-a5c7-e42f0e33a7d5` | Aprobada  |
| 17  | Positiva | `GET /api/tasks?search=%20express%20`                                                |         200 |      200 | `d5dfefc1-b51a-4bd8-83d5-71b19994554f` | Aprobada  |
| 18  | Positiva | `GET /api/tasks?sortBy=title&order=asc`                                              |         200 |      200 | `226d4e4a-8377-47a9-864b-a91f2f048612` | Aprobada  |
| 19  | Positiva | `GET /api/tasks?sortBy=title&order=desc`                                             |         200 |      200 | `674854d6-00c3-43cc-b342-a1ef0672cb10` | Aprobada  |
| 20  | Positiva | `GET /api/tasks?sortBy=updatedAt&order=desc`                                         |         200 |      200 | `24beacec-3c15-4a6d-b5d4-c4fe113d5dd1` | Aprobada  |
| 21  | Positiva | `GET /api/tasks?sortBy=status&order=asc&limit=50`                                    |         200 |      200 | `d06da6c4-2f7c-4c8f-ada0-5d18c61fb472` | Aprobada  |
| 22  | Positiva | `GET /api/tasks?order=desc&limit=3`                                                  |         200 |      200 | `f4227d59-2146-46b6-a5f7-b571261a3767` | Aprobada  |
| 23  | Positiva | `GET /api/tasks?status=pending&search=entrega&page=1&limit=2&sortBy=title&order=asc` |         200 |      200 | `f5c67c7a-bbfb-481f-b75c-8d2ab4b779ef` | Aprobada  |
| 24  | Positiva | `GET /api/tasks?status=pending&page=1&limit=2&sortBy=title&order=asc`                |         200 |      200 | `8b151ddc-c064-4449-ab24-8bece3bb55f5` | Aprobada  |

### Casos negativos

| #   | Tipo     | Método y ruta                           | Esperado | Obtenido | requestId                              | Resultado |
| --- | -------- | --------------------------------------- | -------: | -------: | -------------------------------------- | --------- |
| 25  | Negativa | `GET /api/tasks?page=0`                 |      422 |      422 | `c69a271a-a1fc-4355-8150-32116a586f75` | Aprobada  |
| 26  | Negativa | `GET /api/tasks?page=abc`               |      422 |      422 | `e3c33f83-06a8-49fb-ac91-7f519a1584cd` | Aprobada  |
| 27  | Negativa | `GET /api/tasks?page=1&page=2`          |      422 |      422 | `2223fc4e-0358-4f37-81d6-b4d30d389c94` | Aprobada  |
| 28  | Negativa | `GET /api/tasks?page[a]=1`              |      422 |      422 | `0f76e23c-337a-4765-888c-c2f4c6404b86` | Aprobada  |
| 29  | Negativa | `GET /api/tasks?page=100001`            |      422 |      422 | `9226231c-2eed-452b-b4ad-de7977799990` | Aprobada  |
| 30  | Negativa | `GET /api/tasks?limit=0`                |      422 |      422 | `c2d2314c-3377-4087-aaff-6e11478006da` | Aprobada  |
| 31  | Negativa | `GET /api/tasks?limit=51`               |      422 |      422 | `f2cd8b45-e9c5-4010-9424-751cde86d50b` | Aprobada  |
| 32  | Negativa | `GET /api/tasks?status=archived`        |      422 |      422 | `78156dc8-7cac-4d29-89b1-fa9521afdf4c` | Aprobada  |
| 33  | Negativa | `GET /api/tasks?search= (vacío)`        |      422 |      422 | `dd3f2a79-41e3-46e7-afc2-0bfa4f079851` | Aprobada  |
| 34  | Negativa | `GET /api/tasks?search=(61 caracteres)` |      422 |      422 | `df04a3c1-9bb4-42ac-9dbe-483e0e2e8553` | Aprobada  |
| 35  | Negativa | `GET /api/tasks?sortBy=priority`        |      422 |      422 | `81fa1897-6036-418a-9a45-df4503f1c297` | Aprobada  |
| 36  | Negativa | `GET /api/tasks?order=sideways`         |      422 |      422 | `ed77a467-6e5c-4e5c-9905-c6c771826a59` | Aprobada  |
| 37  | Negativa | `GET /api/tasks?owner=ana`              |      422 |      422 | `4e558518-2f88-46f9-8a4b-ce2688c81620` | Aprobada  |

### Desafío createdFrom y createdTo

| #   | Tipo     | Método y ruta                                                                                                                                           | Esperado | Obtenido | requestId                              | Resultado |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------: | -------: | -------------------------------------- | --------- |
| 38  | Desafío  | `GET /api/tasks?createdFrom=2026-11-22T03:11:02.937Z`                                                                                                   |      200 |      200 | `12bbe98a-134e-4135-9bb9-0081b45cc41d` | Aprobada  |
| 39  | Desafío  | `GET /api/tasks?createdTo=2026-11-22T03:11:02.853Z`                                                                                                     |      200 |      200 | `51290de0-55ab-466a-bc6e-1e1d639a169a` | Aprobada  |
| 40  | Desafío  | `GET /api/tasks?createdFrom=2026-11-22T03:11:02.853Z&createdTo=2026-11-22T03:11:03.020Z`                                                                |      200 |      200 | `14f977b3-28a6-478c-9fe3-3c02410010e8` | Aprobada  |
| 41  | Desafío  | `GET /api/tasks?createdFrom=2026-11-22T03:11:02.937Z&createdTo=2026-11-22T03:11:02.937Z`                                                                |      200 |      200 | `4a44d24d-02f0-49e7-8b84-7f5fce2d9ebc` | Aprobada  |
| 42  | Desafío  | `GET /api/tasks?createdFrom=2026-11-22T03:11:02.743Z&createdTo=2026-11-22T03:11:03.119Z&status=pending&search=a&sortBy=title&order=desc&page=1&limit=2` |      200 |      200 | `46b9a5ce-cb29-48a0-89f8-c815f814114e` | Aprobada  |
| 43  | Desafío  | `GET /api/tasks?createdFrom=2099-01-01`                                                                                                                 |      200 |      200 | `e75e6f30-f8f4-4656-a533-494698f7b09a` | Aprobada  |
| 44  | Desafío  | `GET /api/tasks?createdFrom=2020-01-01&createdTo=2099-12-31`                                                                                            |      200 |      200 | `3c305398-1c42-48ce-bb29-1426989a4259` | Aprobada  |
| 45  | Negativa | `GET /api/tasks?createdFrom=ayer`                                                                                                                       |      422 |      422 | `b4432fb7-cefa-4297-ba58-442834ac95fe` | Aprobada  |
| 46  | Negativa | `GET /api/tasks?createdTo=2026-13-01`                                                                                                                   |      422 |      422 | `db8b980c-c56f-4b27-a6f6-68d9a0c5d128` | Aprobada  |
| 47  | Negativa | `GET /api/tasks?createdFrom=2026-02-31`                                                                                                                 |      422 |      422 | `21a1ee60-d6de-429f-a7c4-a33fbdac1247` | Aprobada  |
| 48  | Negativa | `GET /api/tasks?createdFrom > createdTo`                                                                                                                |      422 |      422 | `1a675889-871f-4456-bfe1-f179dd16a929` | Aprobada  |
| 49  | Negativa | `GET /api/tasks?createdFrom repetido`                                                                                                                   |      422 |      422 | `b5dbadb7-ba8f-4516-8342-e5f38ca5106f` | Aprobada  |

### Regresión del CRUD de A7

| #   | Tipo      | Método y ruta                                     | Esperado | Obtenido | requestId                              | Resultado |
| --- | --------- | ------------------------------------------------- | -------: | -------: | -------------------------------------- | --------- |
| 50  | Regresión | `POST /api/tasks`                                 |      201 |      201 | `8352a1da-c0ee-44ae-9788-e3a478384b01` | Aprobada  |
| 51  | Regresión | `GET /api/tasks/:id`                              |      200 |      200 | `678d8fbc-40cc-4685-84f2-3b4c14303f05` | Aprobada  |
| 52  | Regresión | `PATCH /api/tasks/:id (title)`                    |      200 |      200 | `61c655ce-71cd-4939-b2e9-984acee7a7e7` | Aprobada  |
| 53  | Regresión | `PATCH /api/tasks/:id (status+priority)`          |      200 |      200 | `013c8749-bfbc-4747-8ef2-e250f2f833fe` | Aprobada  |
| 54  | Regresión | `PATCH /api/tasks/:id/status`                     |      200 |      200 | `cf546480-f766-4919-93a2-0cc6c89a0a32` | Aprobada  |
| 55  | Regresión | `PATCH /api/tasks/:id/complete`                   |      200 |      200 | `e74dd653-365f-4d0e-979a-16087f4a4aa4` | Aprobada  |
| 56  | Regresión | `DELETE /api/tasks/:id`                           |      204 |      204 | `3ffedd9c-6e88-4b6f-bde0-611b350edda2` | Aprobada  |
| 57  | Regresión | `GET /api/tasks/:id (eliminada)`                  |      404 |      404 | `eb74d4f9-4fc3-45a4-8310-2eedeae8be29` | Aprobada  |
| 58  | Regresión | `GET /api/tasks/1`                                |      400 |      400 | `4e2ed510-48db-4b6f-be60-bf9d5dc6a42d` | Aprobada  |
| 59  | Regresión | `PATCH /api/tasks/:id inexistente`                |      404 |      404 | `2526f050-d276-44c1-8a12-eca11b805cd6` | Aprobada  |
| 60  | Regresión | `PATCH /api/tasks/:id cuerpo vacío`               |      422 |      422 | `8fbee0ef-6411-49ce-95e2-f4faf77586a7` | Aprobada  |
| 61  | Regresión | `POST /api/tasks sin application/json`            |      415 |      415 | `d3359701-390b-4079-9dc7-37c18fd47660` | Aprobada  |
| 62  | Regresión | `POST /api/tasks JSON mal formado`                |      400 |      400 | `05b2e0aa-4c7d-4ff6-a36c-bff7e0a7d5f5` | Aprobada  |
| 63  | Regresión | `GET /api/inexistente`                            |      404 |      404 | `a4f9687b-d23f-42ab-bebd-399153006f84` | Aprobada  |
| 64  | Regresión | `GET /api/tasks/:id ignora parámetros de listado` |      200 |      200 | `23aa4d33-041b-4b19-a0e3-e5587dee7dfe` | Aprobada  |

### Persistencia después de reiniciar

| #   | Tipo         | Método y ruta                                            | Esperado | Obtenido | requestId                              | Resultado |
| --- | ------------ | -------------------------------------------------------- | -------: | -------: | -------------------------------------- | --------- |
| 65  | Persistencia | `GET /api/tasks/197bfa tras reiniciar`                   |      200 |      200 | `19bab70e-2b01-418f-a3be-903c6de3c5e0` | Aprobada  |
| 66  | Persistencia | `GET /api/tasks/197bfc tras reiniciar`                   |      200 |      200 | `d2aa4e0c-81d2-4225-b11a-bb6e93817ba0` | Aprobada  |
| 67  | Persistencia | `GET /api/tasks/197bfe tras reiniciar`                   |      200 |      200 | `9436934d-df54-4736-a62d-0aaed701a2a8` | Aprobada  |
| 68  | Persistencia | `GET /api/tasks/197c00 tras reiniciar`                   |      200 |      200 | `3d8e951c-a7c7-4737-847e-d43047baacd2` | Aprobada  |
| 69  | Persistencia | `GET /api/tasks/197c02 tras reiniciar`                   |      200 |      200 | `fd5139db-6594-4c9a-89f0-d095925b8254` | Aprobada  |
| 70  | Persistencia | `GET /api/tasks?status=completed&sortBy=title&order=asc` |      200 |      200 | `b08d8abf-cffc-4246-b98c-3278d9db1128` | Aprobada  |

### Limpieza

| #   | Tipo     | Método y ruta                  | Esperado | Obtenido | requestId                              | Resultado |
| --- | -------- | ------------------------------ | -------: | -------: | -------------------------------------- | --------- |
| 71  | Limpieza | `DELETE 197bfa`                |      204 |      204 | `befe14b8-8204-46c0-9a18-3cb1bed4c0bf` | Aprobada  |
| 72  | Limpieza | `DELETE 197bfc`                |      204 |      204 | `57d913fb-d767-45c3-9dbd-6770e857e8e3` | Aprobada  |
| 73  | Limpieza | `DELETE 197bfe`                |      204 |      204 | `ce3f54c7-c593-4d1e-9e16-c116f84311f5` | Aprobada  |
| 74  | Limpieza | `DELETE 197c00`                |      204 |      204 | `15eeb70b-7983-4474-93ba-8be5e989987f` | Aprobada  |
| 75  | Limpieza | `DELETE 197c02`                |      204 |      204 | `b1116dca-c64b-4810-a9dd-067ef9329783` | Aprobada  |
| 76  | Limpieza | `total final igual al inicial` |        7 |        7 | —                                      | Aprobada  |

### Falla de almacenamiento (503)

| #   | Tipo     | Condición                                | Esperado | Obtenido                                                                                                                                    | Resultado           |
| --- | -------- | ---------------------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 77  | Negativa | `GET /api/tasks` con Atlas no disponible |      503 | Simulada con una prueba unitaria (`TaskModel.find` falla): `AppError` 503 `DATABASE_UNAVAILABLE` y el mensaje no contiene datos de conexión | Aprobada (simulada) |

No se cortó la conexión real con Atlas. Con la API de este proyecto el puerto no se abre si Atlas no responde al arrancar, por lo que la falla durante la ejecución se comprobó con el mock.

## Hallazgos sobre el código del PDF

| Hallazgo                                                                                                                                       | Corrección                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `QUERY_VALIDATION_ERROR` no existía en el tipo `ErrorCode` de `AppError`, así que el middleware no compilaba                                   | Se agregó el código a `src/errors/app-error.ts`                                                                                                   |
| El PDF sustituye `task.service.ts` y `task.controller.ts` completos, lo que eliminaría `description`, `priority` y la ruta `PATCH /:id/status` | Se conservaron: el repositorio y el servicio reciben `description` y `priority`, y `updateTaskTitle` / `updateTaskStatus` delegan en `updateTask` |
| Los nombres de archivo del PDF (`validate-task-id`, `validate-task-title`) no coinciden con los del proyecto                                   | Se conservaron los nombres del proyecto (`validate-id`, `validate-title`)                                                                         |

## Desafío createdFrom y createdTo

- Formatos aceptados: `YYYY-MM-DD` o fecha y hora completas con zona (`Z` o `±HH:mm`). Una fecha sin hora equivale a las 00:00:00.000 UTC de ese día, y `createdTo` se aplica tal cual con `$lte`.
- Se valida el calendario real: `2026-02-31` y `2026-13-01` se rechazan (`Date.parse` aceptaría el primero como 3 de marzo). Una hora sin zona (`2026-11-21T10:00`) también se rechaza para evitar interpretarla en la zona local.
- En una URL, el signo `+` de un desfase debe codificarse como `%2B`; con `Z` no hace falta.
- `createdFrom` posterior a `createdTo` devuelve 422 con el detalle en `createdFrom`.
- El filtro se aplica a `find` y a `countDocuments` con el mismo objeto: `createdAt: { $gte, $lte }`.

## Archivos modificados

| Archivo                                             | Cambio                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/types/task-query.ts`                           | Nuevo. `TaskListQuery`, `TaskPaginationMeta`, `TaskListResult`, constantes y listas permitidas    |
| `src/middlewares/validate-task-query.middleware.ts` | Nuevo. Valida `req.query` y guarda `res.locals.taskQuery`                                         |
| `src/repositories/task.repository.ts`               | Nuevo. Todas las operaciones de Mongoose, `escapeRegex`, filtro, orden estable y `countDocuments` |
| `src/services/task.service.ts`                      | Ya no importa `TaskModel`; transforma documentos y calcula `meta`                                 |
| `src/controllers/task.controller.ts`                | `getTasks` responde con `TaskListResult`                                                          |
| `src/routes/task.routes.ts`                         | `validateTaskQuery` solo en `GET /api/tasks`                                                      |
| `src/errors/app-error.ts`                           | Agrega `QUERY_VALIDATION_ERROR`                                                                   |
| `tests/task.services.test.ts`                       | Pruebas de validación, filtro, `meta`, rango de fechas y 503                                      |

## Evidencias

1. Compilación correcta: `pnpm check`, `pnpm lint`, `pnpm test` y `pnpm build` sin errores.
2. Dos páginas sin documentos repetidos: ver los casos de `page=1&limit=2` y `page=2&limit=2`.
3. Filtro y búsqueda combinados: caso de `status=pending&search=entrega`.
4. Orden ascendente y descendente: casos de `sortBy=title`.
5. Error 422 con `details` y `requestId`: sección de casos negativos.
6. CRUD heredado completo: sección de regresión.
7. Persistencia después de reiniciar: sección de persistencia.
8. Capturas de Postman y de Atlas Data Explorer: pendientes de agregar por quien entrega la actividad. Deben ocultar la URI, el usuario, la contraseña y el host.

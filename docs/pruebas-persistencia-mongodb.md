# Pruebas de persistencia con MongoDB Atlas

Actividad EC2 F2 A6. No se incluyen la URI, el usuario, la contraseña, el host ni capturas que los muestren.

## Entorno

- Rama: `feature/modelo-tareas-mongodb`
- Base de datos: `task_api`
- Colección: `tasks`
- `pnpm check`: sin errores
- `pnpm lint`: sin errores
- `pnpm test`: 5 pruebas aprobadas (modelo, `validateId` y `validateDescription`)
- `pnpm build`: sin errores

## Colección de Postman

Importar `postman/Task-API-EC2-F2-A6.postman_collection.json`. Contiene la carpeta **EC2 F2 A6 Persistencia**: guarda el id en la variable `taskId` y lo usa mediante `{{taskId}}`. Cada solicitud tiene pruebas automáticas del código HTTP.

## Tabla de pruebas

> Completar las columnas **Obtenido**, **requestId** y **Resultado** después de ejecutar la colección con Atlas accesible. Al preparar este documento, Atlas rechazó la conexión desde la IP en uso (falta autorizarla en Network Access), por lo que las pruebas HTTP aún no se han ejecutado.

| #   | Tipo         | Método y ruta                                      | Datos                              | Esperado                                       | Obtenido  | requestId | Resultado |
| --- | ------------ | -------------------------------------------------- | ---------------------------------- | ---------------------------------------------- | --------- | --------- | --------- |
| 1   | Positiva     | GET /health/database                               | No aplica                          | 200 connected                                  | Pendiente |           | Pendiente |
| 2   | Positiva     | POST /api/tasks                                    | título y descripción               | 201, `id` string de 24 hex, sin `_id` ni `__v` | Pendiente |           | Pendiente |
| 3   | Positiva     | GET /api/tasks                                     | No aplica                          | 200                                            | Pendiente |           | Pendiente |
| 4   | Positiva     | GET /api/tasks/{{taskId}}                          | No aplica                          | 200                                            | Pendiente |           | Pendiente |
| 5   | Positiva     | PATCH /api/tasks/{{taskId}}/complete               | No aplica                          | 200 completed                                  | Pendiente |           | Pendiente |
| 6   | Positiva     | GET /api/tasks/{{taskId}}                          | No aplica                          | 200 completed                                  | Pendiente |           | Pendiente |
| 7   | Desafío      | POST /api/tasks                                    | solo título                        | 201 sin `description`                          | Pendiente |           | Pendiente |
| 8   | Positiva     | DELETE /api/tasks/{{taskId}}                       | No aplica                          | 204                                            | Pendiente |           | Pendiente |
| 9   | Negativa     | GET /api/tasks/{{taskId}}                          | No aplica                          | 404 TASK_NOT_FOUND                             | Pendiente |           | Pendiente |
| 10  | Negativa     | GET /api/tasks/abc                                 | No aplica                          | 400 INVALID_ID                                 | Pendiente |           | Pendiente |
| 11  | Negativa     | GET /api/tasks/507f1f77bcf86cd799439011            | No aplica                          | 404 TASK_NOT_FOUND                             | Pendiente |           | Pendiente |
| 12  | Negativa     | POST /api/tasks                                    | `{"title":""}`                     | 422 VALIDATION_ERROR                           | Pendiente |           | Pendiente |
| 13  | Negativa     | POST /api/tasks                                    | título de 121 caracteres           | 422 VALIDATION_ERROR                           | Pendiente |           | Pendiente |
| 14  | Negativa     | POST /api/tasks                                    | raw Text                           | 415 UNSUPPORTED_MEDIA_TYPE                     | Pendiente |           | Pendiente |
| 15  | Desafío      | POST /api/tasks                                    | descripción de 301 caracteres      | 422 VALIDATION_ERROR                           | Pendiente |           | Pendiente |
| 16  | Persistencia | GET /api/tasks/:id tras detener y reiniciar la API | tarea con descripción creada antes | 200 con los mismos datos                       | Pendiente |           | Pendiente |

Id utilizado en la prueba de persistencia: _pendiente_

## Comprobación del reinicio

1. Crear una tarea con título y descripción y anotar su `id`.
2. Detener la API con Ctrl+C (mensaje de cierre ordenado).
3. Iniciarla de nuevo con `pnpm dev`.
4. Consultar `GET /api/tasks/{id}`: debe devolver 200 con título, descripción y estado.
5. Confirmar el mismo documento en la colección `tasks` de Atlas.

Resultado: _pendiente de ejecutar_

## Capturas

Pendientes: Postman con la carpeta completa en verde y el documento en Atlas, sin credenciales visibles.

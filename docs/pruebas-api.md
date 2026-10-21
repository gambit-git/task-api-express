# Pruebas de Task API

| #   | Método | Ruta                  | Datos enviados                            | Esperado | Obtenido | Resultado |
| --- | ------ | --------------------- | ----------------------------------------- | -------: | -------: | --------- |
| 1   | GET    | /api/tasks            | No aplica                                 |      200 |      200 | Aprobada  |
| 2   | POST   | /api/tasks            | `{"title":"Documentar mi primera API"}`   |      201 |      201 | Aprobada  |
| 3   | GET    | /api/tasks/3          | No aplica                                 |      200 |      200 | Aprobada  |
| 4   | PATCH  | /api/tasks/3/complete | No aplica                                 |      200 |      200 | Aprobada  |
| 5   | DELETE | /api/tasks/3          | No aplica                                 |      204 |      204 | Aprobada  |
| 6   | GET    | /api/tasks/3          | No aplica                                 |      404 |      404 | Aprobada  |
| 7   | POST   | /api/tasks            | `{"title":""}`                            |      422 |      422 | Aprobada  |
| 8   | GET    | /api/tasks/abc        | No aplica                                 |      400 |      400 | Aprobada  |
| 9   | GET    | /ruta-inexistente     | No aplica                                 |      404 |      404 | Aprobada  |
| 10  | PATCH  | /api/tasks/2          | `{"title":"Practicar Express y Postman"}` |      200 |      200 | Aprobada  |
| 11  | PATCH  | /api/tasks/2          | `{"title":""}`                            |      422 |      422 | Aprobada  |
| 12  | PATCH  | /api/tasks/999        | `{"title":"Título nuevo"}`                |      404 |      404 | Aprobada  |
| 13  | PATCH  | /api/tasks/2/status   | `{"completed":true}`                      |      200 |      200 | Aprobada  |

## Observaciones

Las pruebas permitieron comprobar que la API responde correctamente a las operaciones de consulta, creación, actualización y eliminación de tareas.
También se verificó el manejo de errores cuando se envían datos inválidos, identificadores incorrectos, tareas inexistentes o rutas no registradas.
El desafío individual para editar el título de una tarea mediante `PATCH /api/tasks/:id` funciona correctamente y utiliza la misma arquitectura de rutas, controladores, servicios y middleware de errores.
El estado de una tarea se actualiza mediante `PATCH /api/tasks/:id/status`, enviando `{"completed":true}` o `{"completed":false}`.

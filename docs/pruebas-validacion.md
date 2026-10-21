# Pruebas de validación y errores

Actividad EC1 F3 A4. Pruebas ejecutadas contra la API en memoria (`src/app.ts`) con `fetch`; el mismo conjunto de casos está en la colección de Postman **Task API EC1 F3 A4**. En cada caso de error se comprobó que el `requestId` del cuerpo coincide con el encabezado `X-Request-Id`.

| #   | Caso                                 | Método y ruta               | Datos enviados                            | Esperado                   | Obtenido                   | requestId                              | Resultado |
| --- | ------------------------------------ | --------------------------- | ----------------------------------------- | -------------------------- | -------------------------- | -------------------------------------- | --------- |
| 1   | Listar tareas                        | GET /api/tasks              | No aplica                                 | 200                        | 200                        | `679de818-440f-4231-9a3f-496072e7bdee` | Aprobada  |
| 2   | Obtener tarea válida                 | GET /api/tasks/1            | No aplica                                 | 200                        | 200                        | `6e238dd5-d2ea-47f1-b8b4-c35699c3a7fc` | Aprobada  |
| 3   | Crear tarea válida                   | POST /api/tasks             | `{"title":"Probar validacion"}`           | 201                        | 201                        | `dad2cf16-9d05-43bb-9dc2-73eec1614610` | Aprobada  |
| 4   | ID no numérico                       | GET /api/tasks/abc          | No aplica                                 | 400 INVALID_ID             | 400 INVALID_ID             | `dbeed089-a63e-49c0-8a2d-be52e127442b` | Aprobada  |
| 5   | ID cero                              | GET /api/tasks/0            | No aplica                                 | 400 INVALID_ID             | 400 INVALID_ID             | `bd9bb0bf-e01c-421f-bdbc-a94ce6934696` | Aprobada  |
| 6   | ID decimal                           | GET /api/tasks/1.5          | No aplica                                 | 400 INVALID_ID             | 400 INVALID_ID             | `68c74b55-d928-44e2-9d49-62dd0c8e727a` | Aprobada  |
| 7   | Tarea inexistente                    | GET /api/tasks/999          | No aplica                                 | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND         | `49b1e960-6b37-4fb0-a92d-fbc92fcf2f05` | Aprobada  |
| 8   | Content-Type incorrecto              | POST /api/tasks             | Texto plano (`text/plain`)                | 415 UNSUPPORTED_MEDIA_TYPE | 415 UNSUPPORTED_MEDIA_TYPE | `ac5f287c-cf6b-4459-b0bb-f41dd20c29f6` | Aprobada  |
| 9   | Título vacío                         | POST /api/tasks             | `{"title":""}`                            | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR       | `d92b1dda-d696-4fd5-87cc-aa29bae855aa` | Aprobada  |
| 10  | Título no textual                    | POST /api/tasks             | `{"title":25}`                            | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR       | `5b27d776-8198-4e52-a180-ed75acb953d4` | Aprobada  |
| 11  | Título de 121 caracteres             | POST /api/tasks             | `title` con 121 letras                    | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR       | `1f14cbba-a449-4f0e-a9ec-f04b073b32f9` | Aprobada  |
| 12  | JSON malformado                      | POST /api/tasks             | `{"title":`                               | 400 INVALID_JSON           | 400 INVALID_JSON           | `66071b73-ac43-4c4d-8f34-c445e0f02051` | Aprobada  |
| 13  | Ruta inexistente                     | GET /ruta-inexistente       | No aplica                                 | 404 ROUTE_NOT_FOUND        | 404 ROUTE_NOT_FOUND        | `9b146204-31b1-4764-a73b-ec76790a7fe6` | Aprobada  |
| 14  | Error 500 controlado (ruta temporal) | GET /debug/error            | No aplica                                 | 500 INTERNAL_ERROR         | 500 INTERNAL_ERROR         | `e5479fd5-eaae-431c-8ded-f1411955cb90` | Aprobada  |
| 15  | Regresión: completar tarea           | PATCH /api/tasks/2/complete | No aplica                                 | 200                        | 200                        | `3e637773-6b28-4744-814d-35f800aec662` | Aprobada  |
| 16  | Regresión: eliminar tarea            | DELETE /api/tasks/3         | No aplica                                 | 204                        | 204                        | `e7b39a8e-238d-475a-81bd-da75ef080882` | Aprobada  |
| 17  | Regresión: consultar tarea eliminada | GET /api/tasks/3            | No aplica                                 | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND         | `a78877bc-e52e-4498-93bb-d37e36556c5c` | Aprobada  |
| 18  | Reto: status correcto                | PATCH /api/tasks/2/status   | `{"completed":false}`                     | 200                        | 200                        | `7799b4b6-e551-48e0-9b2d-0faa4ef741b8` | Aprobada  |
| 19  | Reto: completed no booleano          | PATCH /api/tasks/2/status   | `{"completed":"si"}`                      | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR       | `8c70d6f2-3ba1-4cf7-8c18-8a9d2f731756` | Aprobada  |
| 20  | Reto: status de tarea inexistente    | PATCH /api/tasks/999/status | `{"completed":true}`                      | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND         | `11bba733-c106-452b-aeba-9c0b9bbfb381` | Aprobada  |
| 21  | Reto: status sin JSON                | PATCH /api/tasks/2/status   | Texto plano                               | 415 UNSUPPORTED_MEDIA_TYPE | 415 UNSUPPORTED_MEDIA_TYPE | `63951148-dd51-446c-b7a6-9f6170f683b2` | Aprobada  |
| 22  | Editar título                        | PATCH /api/tasks/2          | `{"title":"Practicar Express y Postman"}` | 200                        | 200                        | `d7f8f7fa-5f7e-478b-b055-e79f1915c3b0` | Aprobada  |

## Observaciones

- El error 500 se simuló con una ruta temporal `GET /debug/error` que lanza `Error` (sin `AppError`). Esa ruta **no** existe en `src/app.ts`; solo se montó en una aplicación auxiliar con los mismos middleware `requestId` y `errorHandler`. El cliente recibe un mensaje general y el detalle solo se registra en el servidor.
- Los errores de validación incluyen `details` con el campo y el motivo (por ejemplo `{"field":"title","message":"Debe ser texto no vacío."}`).
- Pendiente de adjuntar por la persona que entrega: capturas de Postman de 400, 404, 415, 422, 500 y una respuesta correcta.

# Pruebas de conexión con MongoDB Atlas

Actividad EC1 F3 A5 (EC2 F1 A5). Pruebas ejecutadas con Postman contra `http://localhost:3000`. No se incluyen la URI, la contraseña ni capturas que las muestren.

## Entorno verificado

- Rama: feature/mongodb-atlas
- Comando de tipos: pnpm check
- Comando de compilación: pnpm build
- Resultado de arranque: conexión establecida sin mostrar credenciales

## Casos ejecutados

| #   | Tipo            | Método y ruta                                    | Datos                               | Esperado                   | Obtenido | requestId | Resultado |
| --- | --------------- | ------------------------------------------------ | ----------------------------------- | -------------------------- | -------- | --------- | --------- |
| 1   | Positiva        | GET /health                                      | No aplica                           | 200 status ok              |          |           |           |
| 2   | Positiva        | GET /health/database                             | No aplica                           | 200 connected              |          |           |           |
| 3   | Regresión       | GET /api/tasks                                   | No aplica                           | 200                        |          |           |           |
| 4   | Regresión       | POST /api/tasks                                  | `{"title":"Preparar persistencia"}` | 201                        |          |           |           |
| 5   | Positiva        | GET /api/tasks/:id                               | id devuelto por el POST             | 200                        |          |           |           |
| 6   | Negativa        | GET /api/tasks/abc                               | No aplica                           | 400 INVALID_ID             |          |           |           |
| 7   | Negativa        | GET /api/tasks/999                               | No aplica                           | 404 TASK_NOT_FOUND         |          |           |           |
| 8   | Negativa        | POST /api/tasks                                  | raw Text                            | 415 UNSUPPORTED_MEDIA_TYPE |          |           |           |
| 9   | Negativa        | POST /api/tasks                                  | `{"title":""}`                      | 422 VALIDATION_ERROR       |          |           |           |
| 10  | Negativa        | GET /ruta-inexistente                            | No aplica                           | 404 ROUTE_NOT_FOUND        |          |           |           |
| 11  | Regresión       | POST /api/tasks                                  | `{"title":"Tarea regresión"}`       | 201                        |          |           |           |
| 12  | Regresión       | GET /api/tasks/:id                               | No aplica                           | 200                        |          |           |           |
| 13  | Regresión       | PATCH /api/tasks/:id/complete                    | No aplica                           | 200 completed              |          |           |           |
| 14  | Regresión       | DELETE /api/tasks/:id                            | No aplica                           | 204                        |          |           |           |
| 15  | Regresión       | GET /api/tasks/:id (tarea eliminada)             | No aplica                           | 404 TASK_NOT_FOUND         |          |           |           |
| 16  | Infraestructura | Reinicio con contraseña temporalmente incorrecta | No aplica                           | API no escucha             |          | No aplica |           |

En la prueba 16 se cambió un carácter de la contraseña en `.env`, se ejecutó `pnpm dev` y el proceso mostró solo el mensaje seguro, sin abrir el puerto. Después se restauró la contraseña correcta.

## Cierre ordenado (desafío individual)

| Acción                                   | Esperado                                                                    | Obtenido | Resultado |
| ---------------------------------------- | --------------------------------------------------------------------------- | -------- | --------- |
| Ctrl+C con la API corriendo (`pnpm dev`) | Mensaje "Servidor HTTP y conexión con MongoDB cerrados." sin error ni stack |          |           |

## Evidencias

1. Captura del despliegue disponible en Atlas sin mostrar usuarios ni credenciales.
2. Captura de GET /health/database.
3. Capturas de una prueba correcta, una validación y una regla del negocio.
4. Evidencia de pnpm check y pnpm build.
5. Resultado de git check-ignore -v .env: `.gitignore:12:.env  .env`
6. Resultado de git ls-files .env: sin salida (el archivo no está registrado).

# Pruebas de conexión con MongoDB Atlas

Actividad EC1 F3 A5 (EC2 F1 A5). Pruebas ejecutadas con Postman contra `http://localhost:3000`; todas dieron el resultado esperado. Los `requestId` corresponden a una repetición de los mismos casos con `curl` sobre la misma API. No se incluyen la URI, la contraseña ni capturas que las muestren.

## Entorno verificado

- Rama: feature/mongodb-atlas
- Comando de tipos: pnpm check
- Comando de compilación: pnpm build
- Resultado de arranque: conexión establecida sin mostrar credenciales

## Casos ejecutados

| #   | Tipo            | Método y ruta                                    | Datos                               | Esperado                   | Obtenido                   | requestId                              | Resultado |
| --- | --------------- | ------------------------------------------------ | ----------------------------------- | -------------------------- | -------------------------- | -------------------------------------- | --------- |
| 1   | Positiva        | GET /health                                      | No aplica                           | 200 status ok              | 200 status ok              | `61109a34-25fa-4b3a-8fe3-d48fe3a9d7b7` | Aprobada  |
| 2   | Positiva        | GET /health/database                             | No aplica                           | 200 connected              | 200 connected              | `a97be4f9-7961-4e90-8d0a-d39ad6835964` | Aprobada  |
| 3   | Regresión       | GET /api/tasks                                   | No aplica                           | 200                        | 200                        | `507dac9f-854a-4dd8-b68c-ecd5377a3425` | Aprobada  |
| 4   | Regresión       | POST /api/tasks                                  | `{"title":"Preparar persistencia"}` | 201                        | 201                        | `995fa248-dbff-40e3-a9d1-c535ecce0157` | Aprobada  |
| 5   | Positiva        | GET /api/tasks/:id                               | id devuelto por el POST             | 200                        | 200                        | `d7b8ac16-da04-480a-8620-4c9e0387e620` | Aprobada  |
| 6   | Negativa        | GET /api/tasks/abc                               | No aplica                           | 400 INVALID_ID             | 400 INVALID_ID             | `bbcbe2fc-9e44-45c0-aaf7-a19dd4b3765f` | Aprobada  |
| 7   | Negativa        | GET /api/tasks/999                               | No aplica                           | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND         | `22fbc767-2fe7-4236-8eb6-374e00a9c6a8` | Aprobada  |
| 8   | Negativa        | POST /api/tasks                                  | raw Text                            | 415 UNSUPPORTED_MEDIA_TYPE | 415 UNSUPPORTED_MEDIA_TYPE | `75d95f78-0eaa-489d-93d1-e2047fb059dd` | Aprobada  |
| 9   | Negativa        | POST /api/tasks                                  | `{"title":""}`                      | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR       | `a64ec864-c235-4441-8ff8-55e19679f149` | Aprobada  |
| 10  | Negativa        | GET /ruta-inexistente                            | No aplica                           | 404 ROUTE_NOT_FOUND        | 404 ROUTE_NOT_FOUND        | `309442c2-c487-4de1-88dd-a81da44e6bbf` | Aprobada  |
| 11  | Regresión       | POST /api/tasks                                  | `{"title":"Tarea regresión"}`       | 201                        | 201                        | `634ca19f-6030-4912-90f0-78b14ac81724` | Aprobada  |
| 12  | Regresión       | GET /api/tasks/:id                               | No aplica                           | 200                        | 200                        | `22dff93d-a7f1-4b18-81f9-799b3e80e982` | Aprobada  |
| 13  | Regresión       | PATCH /api/tasks/:id/complete                    | No aplica                           | 200 completed              | 200 completed              | `1e238943-4748-4bcc-b4fa-08e020051bcc` | Aprobada  |
| 14  | Regresión       | DELETE /api/tasks/:id                            | No aplica                           | 204                        | 204                        | `61399e24-6d2e-4472-bc36-40110bb30f70` | Aprobada  |
| 15  | Regresión       | GET /api/tasks/:id (tarea eliminada)             | No aplica                           | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND         | `353747a7-2608-4373-8194-b28b6659cf42` | Aprobada  |
| 16  | Infraestructura | Reinicio con contraseña temporalmente incorrecta | No aplica                           | API no escucha             | API no escucha             | No aplica                              | Aprobada  |

En la prueba 16 se cambió un carácter de la contraseña en `.env`, se ejecutó `pnpm dev` y el proceso mostró solo el mensaje seguro, sin abrir el puerto. Después se restauró la contraseña correcta.

## Cierre ordenado (desafío individual)

| Acción                                   | Esperado                                                                    | Obtenido                                                          | Resultado |
| ---------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------- |
| Ctrl+C con la API corriendo (`pnpm dev`) | Mensaje "Servidor HTTP y conexión con MongoDB cerrados." sin error ni stack | Mensaje de cierre mostrado; el proceso terminó sin error ni stack | Aprobada  |

## Evidencias

1. Captura del despliegue disponible en Atlas sin mostrar usuarios ni credenciales.
2. Captura de GET /health/database.
3. Capturas de una prueba correcta, una validación y una regla del negocio.
4. Evidencia de pnpm check y pnpm build.
5. Resultado de git check-ignore -v .env: `.gitignore:12:.env  .env`
6. Resultado de git ls-files .env: sin salida (el archivo no está registrado).

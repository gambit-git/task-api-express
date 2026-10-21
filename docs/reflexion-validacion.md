# Reflexión — EC1 F3 A4

Validación, middleware y manejo centralizado de errores en Express.

## 1. ¿Qué diferencia existe entre validar el formato HTTP y proteger una regla del negocio?

Validar el formato HTTP es comprobar que la solicitud llega bien formada: que el `Content-Type` sea `application/json`, que el `id` de la URL sea un entero positivo o que `title` sea texto. Eso lo hacen los middleware (`requireJson`, `validateId`, `validateTitle`) antes de llegar al controlador. Una regla del negocio es una condición que debe cumplirse sin importar quién llame al código, por ejemplo que una tarea solicitada exista (`findTaskById` lanza `TASK_NOT_FOUND`). El servicio conserva también una defensa mínima sobre el título para no depender de que alguien más ya lo validó.

## 2. ¿Por qué conviene usar `router.param` para validar el id?

Porque la validación se escribe y se registra una sola vez (`taskRouter.param("id", validateId)`) y se ejecuta automáticamente en todas las rutas que contienen `:id`. Así no se repite en cada ruta ni se olvida en una nueva. Además, el `id` ya validado queda guardado como número en `res.locals.taskId`.

## 3. ¿Qué ventaja ofrece guardar datos normalizados en `res.locals`?

El controlador recibe datos listos para usar: el `id` ya convertido a número y el `title` sin espacios al inicio y al final. No tiene que repetir conversiones ni `trim()`, y no vuelve a leer `req.params` o `req.body` sin validar. También separa responsabilidades: el middleware prepara el dato y el controlador solo coordina.

## 4. ¿Cuándo corresponde responder 400 y cuándo 422?

Responde 400 cuando la solicitud no se puede interpretar: un `id` como `abc` (`INVALID_ID`) o un cuerpo con JSON malformado (`INVALID_JSON`). Responde 422 cuando el JSON es válido pero sus campos no cumplen las reglas: `{"title":""}`, `{"title":25}` o un título de más de 120 caracteres (`VALIDATION_ERROR`).

## 5. ¿Por qué `notFound` delega el error en lugar de responder directamente?

Para que todas las respuestas de error tengan el mismo formato y salgan de un solo lugar. `notFound` solo crea un `AppError` con `ROUTE_NOT_FOUND` y lo pasa con `next`; el `errorHandler` lo convierte en JSON con `code`, `message` y `requestId`. Si el formato cambia, se modifica en un único punto.

## 6. ¿Qué información no debe enviarse al cliente en un error 500?

No deben enviarse el stack, la ruta de archivos, el mensaje original del error, consultas, URI, usuarios, contraseñas ni nombres de servidores. El cliente solo recibe un mensaje general y el `requestId`; el detalle se registra en el servidor con `console.error`.

## 7. ¿Cómo ayuda `requestId` durante la depuración?

Cada solicitud recibe un identificador único, que se devuelve en el encabezado `X-Request-Id` y en el cuerpo del error. Si un usuario reporta un fallo, basta con pedirle ese valor para encontrar en los registros del servidor la solicitud exacta (el `console.error` también lo incluye) sin confundirla con otras.

## 8. ¿Qué prueba demuestra que la refactorización no rompió la API anterior?

Las pruebas de regresión: volver a ejecutar `PATCH /api/tasks/:id/complete` y `DELETE /api/tasks/:id` con un id válido, comprobar que consultar la tarea eliminada responde 404, y confirmar que las pruebas del servicio (`pnpm test`) siguen pasando. Quedaron registradas en `docs/pruebas-validacion.md`.

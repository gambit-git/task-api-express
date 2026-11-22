# Reflexión — EC2 F2 A7

Implementación completa del CRUD persistente con Express y MongoDB Atlas.

## 1. ¿Qué operación de Mongoose corresponde a cada letra de CRUD?

**Create** es `TaskModel.create`, que se usa en `createTask` y responde 201. **Read** son `TaskModel.find().sort({ createdAt: 1 })` para listar y `TaskModel.findById` para consultar una tarea; responden 200. **Update** es `TaskModel.findByIdAndUpdate` con `$set`, que usa `updateTask` en `PATCH /api/tasks/:id` y responde 200. **Delete** es `TaskModel.findByIdAndDelete` y responde 204. La ruta `PATCH /api/tasks/:id/complete` también es Update, pero con un cambio fijo.

## 2. ¿Por qué se usa PATCH y no un reemplazo completo del documento?

Porque el cliente suele querer cambiar un solo dato. Con PATCH puede enviar `{"status":"completed"}` y el título queda como estaba. Un reemplazo completo (PUT) obligaría a mandar todos los campos cada vez, y si el cliente olvida uno se perdería su valor. Además, un reemplazo permitiría pisar `createdAt` o `_id`, que no le pertenecen al cliente.

## 3. ¿Qué problema evita `$set`?

Evita sobrescribir el documento entero. `$set` le indica a MongoDB que modifique únicamente los campos incluidos en el objeto de cambios. Si se actualiza solo el título, `status`, `description` y `createdAt` no se tocan. En las pruebas, un `PATCH` con `{"title":"..."}` devolvió el mismo `status` que antes, y `createdAt` no cambió en ninguna actualización.

## 4. ¿Qué efecto tienen `new: true` y `runValidators: true`?

`new: true` hace que `findByIdAndUpdate` devuelva el documento ya actualizado. Sin esa opción, Mongoose devuelve el estado anterior y la respuesta del PATCH mostraría datos viejos. `runValidators: true` aplica las reglas del esquema (el `enum` de `status` y de `priority`, el `maxlength` de `title`) también durante la actualización; por defecto Mongoose no las valida en `findByIdAndUpdate`. Es la segunda barrera detrás de `validateTaskUpdate`.

## 5. ¿Por qué un cuerpo vacío debe rechazarse?

Porque no expresa ningún cambio. `{}` no es una actualización válida: llegaría a MongoDB como un `$set` vacío, la operación no haría nada útil y la API respondería 200 como si hubiera pasado algo. `validateTaskUpdate` lo detecta con `Object.keys(body).length === 0` y responde 422 `VALIDATION_ERROR` con el detalle "Incluye al menos title, status o priority." para que el cliente corrija su solicitud.

## 6. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?

`INVALID_ID` (400) significa que el id ni siquiera tiene forma de ObjectId, por ejemplo `/api/tasks/1`; lo detecta `validateId` antes de consultar la base. `TASK_NOT_FOUND` (404) significa que el id es válido, como `64b7f0c2a1b2c3d4e5f60718`, pero no existe ningún documento con ese id; lo detecta el servicio cuando `findByIdAndUpdate` devuelve `null`. El primero es un error del cliente en el formato y el segundo es un recurso ausente. Una falla de almacenamiento es otra cosa distinta: `DATABASE_UNAVAILABLE` (503).

## 7. ¿Qué responsabilidad cumple `validateTaskUpdate` y cuál cumple `TaskModel`?

`validateTaskUpdate` protege el contrato HTTP: confirma que el cuerpo sea un objeto JSON, rechaza arreglos, cuerpos vacíos y campos que no se pueden modificar (`owner`, `_id`, `createdAt`), y entrega un `TaskUpdate` limpio. Responde 422 `VALIDATION_ERROR` sin tocar la base de datos. `TaskModel` protege los datos almacenados: aplica `trim`, `maxlength`, los `enum` y los valores predeterminados, y falla con 422 `PERSISTENCE_VALIDATION_ERROR` si otro código llama al servicio sin pasar por la ruta. La repetición es intencional.

## 8. ¿Cómo llega un error de `updateTask` al `errorHandler` de Express 5?

El controlador `patchTask` es `async` y hace `await updateTask(...)`. Si `updateTask` lanza un `AppError` (404, 422 o 503), la promesa del controlador se rechaza. Express 5 detecta esa promesa rechazada, omite los middlewares normales restantes y entrega el error al `errorHandler`, que responde con `code`, `message`, `details` y `requestId` sin mostrar stack ni URI. Por eso los controladores no necesitan `try/catch` ni llamar a `next(error)`.

## 9. ¿Por qué DELETE responde 204 sin cuerpo?

Porque 204 significa "la operación se realizó y no hay nada que devolver". El recurso ya no existe, así que no hay un documento que mostrar. En el proyecto se responde con `res.status(204).send()` y no con `.json()`; en las pruebas el cuerpo llegó vacío. Si se eliminara dos veces el mismo id, el segundo intento responde 404 `TASK_NOT_FOUND`, y eso es correcto.

## 10. ¿Qué prueba demuestra que el CRUD es persistente y no solo funcional en memoria?

Detener el proceso de Node y volver a iniciarlo. Las variables del servidor desaparecen con el reinicio, pero los documentos de Atlas no. Se creó una tarea, se actualizó su título, se detuvo la API (el puerto 3000 quedó cerrado), se inició de nuevo y `GET /api/tasks/:id` devolvió el mismo `id`, el título actualizado y el mismo `updatedAt`. Lo mismo ocurrió con `priority`. Después se eliminó la tarea y la consulta posterior respondió 404.

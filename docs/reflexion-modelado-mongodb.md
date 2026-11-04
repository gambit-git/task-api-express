# Reflexión — EC2 F2 A6

Modelado de documentos y persistencia de tareas en MongoDB Atlas.

## 1. ¿Qué diferencia existe entre un documento, un esquema y un modelo?

El **documento** es el dato guardado en Atlas: una tarea concreta, por ejemplo `{ title: "Preparar la API", status: "pending" }`. El **esquema** (`taskSchema`) describe las reglas que debe cumplir cualquier documento: `title` obligatorio, máximo 120 caracteres, `status` solo `pending` o `completed`. El **modelo** (`TaskModel`) es la herramienta construida a partir del esquema que permite operar sobre la colección `tasks`: `create`, `find`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`.

## 2. ¿Por qué la API devuelve `id` en lugar de `_id`?

`_id` es un detalle interno de MongoDB y su tipo es `ObjectId`, que no es un texto. Si se serializara tal cual, el cliente dependería del motor de base de datos. La función `toTask` del servicio convierte `_id` en `id` de tipo `string` y construye una respuesta pública (`Task`) con solo los campos que el cliente necesita, así que tampoco aparece `__v`. Si algún día cambia la base de datos, el contrato de la API no cambia.

## 3. ¿Qué problema evita migrar todas las operaciones a una sola fuente de datos?

Evita tener dos verdades al mismo tiempo. Si crear usara Atlas pero completar o eliminar siguiera usando el arreglo en memoria, una tarea podría existir en un lugar y no en el otro: se crearía, pero al completarla daría 404, o desaparecería al reiniciar. Por eso se eliminó `src/data/tasks.ts` y todas las funciones del servicio usan únicamente `TaskModel`. Además, así el compilador avisa si queda alguna importación del arreglo.

## 4. ¿Qué reglas aplica el middleware y cuáles repite el esquema?

`validateTitle` revisa que el título sea texto no vacío y de máximo 120 caracteres; `validateDescription` revisa que la descripción, si llega, sea texto de máximo 300; `requireJson` exige `Content-Type: application/json`; `validateId` exige un ObjectId de 24 caracteres hexadecimales. El esquema repite las reglas de datos (`required`, `trim`, `maxlength`, `enum`). La repetición es intencional: el middleware responde pronto con un error HTTP claro (400, 415 o 422 `VALIDATION_ERROR`) y el esquema protege la base de datos aunque en el futuro otro código llame al servicio sin pasar por la ruta (422 `PERSISTENCE_VALIDATION_ERROR`).

## 5. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?

`INVALID_ID` (400) significa que el identificador está mal formado: `abc` o `1` no pueden ser un ObjectId, así que ni siquiera se consulta la base. `TASK_NOT_FOUND` (404) significa que el id tiene el formato correcto, por ejemplo `507f1f77bcf86cd799439011`, pero no existe ningún documento con él, o ya fue eliminado. La primera es un error del cliente en la forma de la petición; la segunda, un recurso ausente.

## 6. ¿Qué hacen `timestamps` y `versionKey: false`?

`timestamps: true` hace que Mongoose agregue y mantenga `createdAt` al crear y `updatedAt` en cada modificación, sin que el código tenga que asignarlos. `versionKey: false` desactiva el campo `__v`, que Mongoose usa para controlar versiones de documentos con arreglos internos; en esta API no se necesita y solo ensuciaría los documentos y las respuestas.

## 7. ¿Por qué los controladores deben usar `async` y `await`?

Porque las operaciones de Mongoose consultan una red y devuelven promesas. Sin `await`, el controlador respondería con una promesa pendiente o antes de que Atlas termine, y un error de la base se perdería como rechazo no manejado. Con `await`, `res.status(200).json({ data: await listTasks() })` responde solo cuando hay datos, y si el servicio falla, la función `async` se rechaza.

## 8. ¿Cómo llega un `AppError` asíncrono al `errorHandler` de Express 5?

Express 5 detecta cuando un manejador `async` devuelve una promesa rechazada y llama automáticamente a `next(error)` con el motivo. Cuando `findTaskById` lanza `AppError(..., 404, "TASK_NOT_FOUND")`, el controlador se rechaza, Express lo reenvía y `errorHandler` lo convierte en `{ error: { code, message, requestId } }` con el estado correcto. En Express 4 habría que usar `try/catch` con `next(error)` en cada controlador.

## 9. ¿Qué prueba demuestra realmente que una tarea es persistente?

Crear una tarea, **detener completamente la API**, volver a iniciarla y consultarla con el mismo id: debe responder 200 con los mismos datos. Además, el documento debe verse en la colección `tasks` de Atlas. Una consulta inmediata después de crear no demuestra nada, porque con el arreglo en memoria también funcionaba; lo que prueba la persistencia es que sobreviva a la muerte del proceso Node.js.

## 10. ¿Qué información de Mongoose o Atlas nunca debe aparecer en la respuesta HTTP?

La cadena de conexión `MONGODB_URI` (usuario, contraseña y host del clúster), nombres de usuarios de base de datos, el stack trace, mensajes internos de Mongoose o del driver (que pueden incluir hosts o IPs), `_id` como ObjectId crudo y `__v`. Por eso `mapPersistenceError` convierte cualquier fallo desconocido en el mensaje genérico 503 `DATABASE_UNAVAILABLE` y el detalle completo, si hace falta, solo se registra en el servidor.

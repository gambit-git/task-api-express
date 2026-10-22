# Reflexión — EC1 F3 A5

Configuración de MongoDB Atlas y conexión segura desde Express.

## 1. ¿Qué diferencia existe entre tu cuenta de Atlas y el usuario de base de datos?

La cuenta de Atlas sirve para entrar a la página web y administrar proyectos, clústeres, accesos de red y usuarios. El usuario de base de datos (`task_api_user`) es una credencial distinta que usa solo la aplicación para autenticarse contra el clúster. Por eso el usuario tiene únicamente `readWrite` sobre `task_api`: si su contraseña se filtra, no da acceso a la cuenta ni a otras bases.

## 2. ¿Por qué `MONGODB_URI` se considera un secreto aunque el repositorio sea privado?

Porque contiene el usuario y la contraseña con los que se accede a los datos. Un repositorio privado puede compartirse, clonarse, copiarse a otro equipo o hacerse público por error, y el historial de Git conserva el secreto aunque se borre en un commit posterior. Por eso vive en `.env`, que está en `.gitignore`, y en el repositorio solo queda `.env.example` con valores de ejemplo.

## 3. ¿Qué riesgo introduce permitir `0.0.0.0/0` en la lista de acceso?

Permite que cualquier dirección de internet intente conectarse al clúster. La contraseña pasa a ser la única defensa y queda expuesta a ataques de fuerza bruta o a una filtración de la URI. Autorizar solo mi IP actual reduce la superficie de ataque, aunque obliga a actualizarla cuando cambia (por ejemplo, al cambiar de red). Ese cambio me pasó: la API no conectaba hasta que añadí mi IP en Network Access.

## 4. ¿Por qué la API espera `connectDatabase` antes de ejecutar `app.listen`?

Para no anunciar un servidor disponible que no puede usar su base de datos. En `startServer` primero se valida el entorno y se conecta a Atlas; solo si eso funciona se abre el puerto. Si la conexión falla, se muestra un mensaje seguro y el proceso termina con código 1 sin escuchar solicitudes. Así un fallo de infraestructura se detecta al arrancar y no cuando llega el primer cliente.

## 5. ¿Qué comprueba `readyState` y qué añade el comando `ping`?

`mongoose.connection.readyState` indica el estado que Mongoose cree tener: el valor 1 significa conectado. Es una información local, no prueba que el clúster responda en ese instante. El comando `ping` envía una petición real a MongoDB y espera respuesta, así que confirma que la conexión funciona de verdad. `checkDatabaseHealth` usa ambos: primero `readyState` y después `ping`.

## 6. ¿Por qué una falla de MongoDB corresponde a infraestructura y no a validación HTTP?

La validación HTTP revisa lo que envía el cliente: un id mal formado, un JSON inválido o un título vacío. Cuando MongoDB no responde, la solicitud del cliente puede ser perfectamente correcta; el problema está en un recurso del servidor. Por eso la respuesta es 503 `DATABASE_UNAVAILABLE` y no 400 o 422. En el arranque con la contraseña incorrecta ni siquiera existe una solicitud HTTP.

## 7. ¿Cómo llega un `AppError` lanzado por `getDatabaseHealth` al manejador central en Express 5?

`getDatabaseHealth` es una función `async`. En Express 5, si un manejador async lanza un error o devuelve una promesa rechazada, Express la captura y llama a `next(error)` automáticamente, sin necesidad de `try/catch` ni `next` en el controlador. El error viaja por la cadena de middlewares hasta `errorHandler`, que reconoce que es un `AppError` y responde con su `statusCode`, `code`, `message` y el `requestId`.

## 8. ¿Qué pruebas demuestran que la incorporación de Atlas no rompió la API anterior?

La regresión completa en Postman: `GET /api/tasks`, `POST /api/tasks` (201), `GET /api/tasks/:id` (200), `PATCH /api/tasks/:id/complete` (200), `DELETE /api/tasks/:id` (204) y una consulta final que da 404. También los casos negativos del EC1: `INVALID_ID`, `TASK_NOT_FOUND`, `UNSUPPORTED_MEDIA_TYPE`, `VALIDATION_ERROR` y `ROUTE_NOT_FOUND`, que mantienen el mismo formato de error y el `X-Request-Id`.

## 9. ¿Por qué el arreglo en memoria se conserva todavía en esta actividad?

Porque el objetivo de A5 es solo configurar y comprobar la conexión de forma segura. Cambiar el CRUD a MongoDB al mismo tiempo mezclaría dos problemas y haría más difícil saber qué falló. Con el arreglo en memoria las rutas y validaciones del EC1 siguen funcionando sin cambios, y la persistencia se incorporará en las siguientes actividades. Por eso, al reiniciar la API, las tareas vuelven a ser las dos iniciales.

## 10. ¿Qué información debe ocultarse al cliente cuando ocurre un error de conexión?

La URI, el usuario, la contraseña, el nombre del host o del clúster, el stack y los objetos internos de Mongoose. Esos datos ayudan a un atacante a localizar el servicio y a probar credenciales. Al cliente solo se le entrega el mensaje general "La base de datos no está disponible.", el código `DATABASE_UNAVAILABLE` y el `requestId`. En el arranque, la terminal solo muestra el mensaje seguro sobre revisar `MONGODB_URI`, el usuario y la lista de acceso de red.

## Sobre el cierre ordenado

Liberar la conexión al recibir `SIGINT` o `SIGTERM` evita dejar conexiones abiertas en el clúster, permite que las operaciones en curso terminen y hace que el proceso termine sin errores. Se cierra primero el servidor HTTP, para dejar de aceptar solicitudes, y después MongoDB. Una bandera (`shuttingDown`) impide ejecutar el cierre dos veces.

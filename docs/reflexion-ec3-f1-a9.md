# Reflexión EC3 F1 A9

## 1. ¿Por qué un hash de contraseña no debe poder descifrarse?

Porque la API no necesita recuperar la contraseña, solo comprobar si la que se escribe es la correcta. Si alguien robara la base de datos, no obtendría las contraseñas directamente. En el proyecto, la colección `users` solo guarda `passwordHash`, y el login usa `bcrypt.compare` para comparar. Aun así, una contraseña débil se podría adivinar probando muchas opciones; por eso se exigen 15 caracteres y se usan 12 rondas.

## 2. ¿Qué diferencia existe entre una sal aleatoria y la clave usada para firmar HS256?

La sal la genera bcrypt para cada contraseña, queda guardada dentro del hash y no es secreta. Hace que dos usuarios con la misma contraseña tengan hashes distintos. La clave `JWT_SECRET` es una sola para el servidor, es secreta, vive en `.env` y sirve para firmar y verificar tokens. Si se filtrara, alguien podría fabricar tokens falsos.

## 3. ¿Por qué `passwordHash` tiene `select: false` y aun así el login puede recuperarlo?

`select: false` hace que Mongoose no devuelva el campo en las consultas normales, para no exponerlo por descuido. El login lo pide de forma explícita: `findUserDocumentByEmail(email, true)` agrega `select("+passwordHash")`. El registro no lo pide.

## 4. ¿Por qué `unique` no sustituye la validación HTTP del correo?

`unique` solo crea un índice en MongoDB que impide repetir un correo. No revisa que el texto tenga forma de correo. El middleware valida el tipo, el formato y la longitud, y pasa el correo a minúsculas antes de llegar a la base; si falla, responde 422 indicando el campo. Si dos registros con el mismo correo llegan a la vez, el índice sigue protegiendo y el repositorio responde 409.

## 5. ¿Qué riesgo evita rechazar el campo `role` durante el registro?

Evita que cualquiera se convierta en administrador enviando `"role": "admin"`. El validador solo permite `name`, `email`, `password` y `confirmPassword`, así que responde 422. Además, el servicio asigna siempre `role: "user"`.

## 6. ¿Por qué correo inexistente y contraseña incorrecta devuelven el mismo mensaje?

Para no revelar qué correos están registrados. En los dos casos la API responde `401 INVALID_CREDENTIALS` con el mismo texto, y compara contra un hash falso cuando el correo no existe para que el tiempo de respuesta sea parecido. Hay que considerar que el registro sí indica que un correo ya existe (409), por lo que esta medida protege el login, no todo el módulo.

## 7. ¿Qué información contiene el JWT de esta actividad y qué información se excluye?

Contiene el id del usuario (`sub`), el rol (`role`), el emisor (`iss`), la audiencia (`aud`), la fecha de emisión (`iat`) y la de expiración (`exp`). No contiene nombre, correo, contraseña ni hash, porque un JWT está firmado pero no cifrado: quien lo tenga puede leerlo.

## 8. ¿Qué validan `issuer`, `audience`, `algorithms` y `exp`?

`issuer` comprueba que el token lo emitió esta API; `audience`, que se creó para este cliente; `algorithms` solo acepta HS256; y `exp` rechaza los tokens vencidos (en el proyecto duran 1 hora). Si algo falla, `verifyAccessToken` responde `401 INVALID_TOKEN`.

## 9. ¿Cómo llega un error de MongoDB desde el repositorio hasta `errorHandler` en Express 5?

El repositorio ejecuta la consulta dentro de `execute`. Si falla, `mapPersistenceError` convierte el error en un `AppError` y lo lanza. El servicio y el controlador usan `await` y no lo atrapan, así que la promesa del controlador se rechaza. Express 5 detecta ese rechazo y lo envía a `errorHandler`, que responde con `code`, `message`, `details` y `requestId`. Por ejemplo, un correo repetido responde 409 y una falla de conexión, 503, sin mostrar la URI.

## 10. ¿Por qué las rutas de tareas permanecen públicas en A9 y qué cambiará en A10?

Porque la A9 solo crea la identidad: registro, login y token. Separarlo permite comprobar que la autenticación funciona sin romper las tareas. En la A10 un middleware leerá el encabezado `Authorization: Bearer`, verificará el token con `verifyAccessToken` y aplicará permisos según el rol.

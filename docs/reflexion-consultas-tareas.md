# Reflexión — EC2 F3 A8

Arquitectura por capas, paginación, filtros, búsqueda y ordenamiento en `GET /api/tasks`.

## 1. ¿Qué responsabilidad nueva cumple `task.repository.ts`?

Concentra todo el acceso a MongoDB. Antes el servicio hablaba directamente con `TaskModel`; ahora solo el repositorio lo importa. Ahí se construyen el filtro, el orden, `skip` y `limit`, se ejecutan `find`, `countDocuments`, `create`, `findByIdAndUpdate` y `findByIdAndDelete`, y se traducen los errores técnicos a `AppError` (422 `PERSISTENCE_VALIDATION_ERROR` o 503 `DATABASE_UNAVAILABLE`). El servicio queda con las reglas de la aplicación: convertir documentos con `toTask`, calcular `meta` y decidir cuándo una ausencia es `TASK_NOT_FOUND`. Si algún día cambia la base de datos, solo se reescribe esta capa.

## 2. ¿Por qué el middleware debe validar `req.query` antes del controlador?

Porque los parámetros de la URL los escribe el cliente y no son confiables: Express los entrega como texto, arreglos u objetos (`?page=1&page=2` llega como arreglo y `?page[a]=1` como una clave distinta). `validateTaskQuery` los trata como `unknown`, rechaza los desconocidos, repetidos y fuera de rango, y entrega un `TaskListQuery` limpio en `res.locals.taskQuery`. Así el controlador no interpreta cadenas, el repositorio nunca recibe basura y una URL inválida responde 422 `QUERY_VALIDATION_ERROR` sin tocar Atlas, en lugar de un 500 o un 503 engañoso.

## 3. ¿Cómo se calcula `skip` para una página determinada?

`skip = (page - 1) × limit`. Con `page=2&limit=5` se saltan 5 documentos y se devuelven los siguientes 5; con `page=1` no se salta ninguno. En el repositorio se calcula como `(query.page - 1) * query.limit` y se encadena con `.skip(skip).limit(query.limit)` después de `.sort(...)`.

## 4. ¿Por qué `find` y `countDocuments` deben usar el mismo filtro?

Porque `meta.total` describe el conjunto filtrado, no la colección entera. En las pruebas, con `status=completed` el listado devolvió 2 tareas y `meta.total` fue 2; si `countDocuments` no recibiera el filtro habría dicho 12 y `totalPages` y `hasNextPage` serían falsos. Por eso `buildFilter` se llama una sola vez y el mismo objeto se pasa a las dos consultas, y hay una prueba que compara ambos filtros.

## 5. ¿Qué problema evita `escapeRegex`?

Evita que el texto del usuario se interprete como una expresión regular. La búsqueda usa `$regex` con la opción `i`; si `search=.*` se pasara tal cual, coincidiría con todos los títulos, y `search=(` produciría una expresión inválida y un error de MongoDB. `escapeRegex` antepone una barra a los metacaracteres (`.*+?^${}()|[]\`), así que `.*` se busca como esas dos letras literales. En las pruebas, `search=.*` devolvió 0 resultados en lugar de toda la colección, y `search=(` respondió 200 con 0 resultados en lugar de un error.

## 6. ¿Por qué `sortBy` utiliza una lista permitida?

Porque el valor de `sortBy` se usa como nombre de campo dentro de `sort`. Si se aceptara cualquier cadena, el cliente podría ordenar por campos internos o inexistentes y hacer consultas costosas sin índice. `TASK_SORT_FIELDS` limita los valores a `createdAt`, `updatedAt`, `title` y `status`, y `isTaskSortField` verifica la pertenencia antes de construir el orden. Cualquier otro valor, como `sortBy=priority`, responde 422. Además se agrega `_id` como segundo criterio para que el orden sea estable cuando dos tareas comparten el mismo valor.

## 7. ¿Qué diferencia existe entre `data.length`, `meta.total` y `meta.totalPages`?

`data.length` es cuántas tareas trae esta respuesta (máximo `limit`). `meta.total` es cuántas tareas cumplen el filtro en toda la colección. `meta.totalPages` es `Math.ceil(total / limit)`. Ejemplo de las pruebas: con 12 tareas y `page=2&limit=5`, `data.length` es 5, `total` es 12 y `totalPages` es 3. En la última página `data.length` puede ser menor que `limit` (2 en la página 3), y si la página pasa del total, `data` queda vacío pero `total` y `totalPages` siguen describiendo la colección.

## 8. ¿Cómo llega un error asíncrono del repositorio al `errorHandler` de Express 5?

`getTasks` es una función `async` que hace `await listTasks(...)`, y `listTasks` hace `await findTaskDocuments(...)`. Si `Promise.all` falla dentro del repositorio, `execute` lo captura y lanza un `AppError` (por ejemplo 503). Esa promesa rechazada sube por el servicio hasta el controlador, y Express 5 detecta que el controlador devolvió una promesa rechazada: omite los middlewares restantes y entrega el error al `errorHandler`, que responde con `code`, `message`, `details` y `requestId` sin stack ni datos de conexión. Por eso el controlador no necesita `try/catch` ni `next(error)`.

## 9. ¿Qué prueba demuestra que A8 no rompió el CRUD de A7?

La regresión completa sobre la misma colección: crear (201), consultar por id (200), `PATCH /:id` (200), `PATCH /:id/status` (200), `PATCH /:id/complete` (200), eliminar (204 sin cuerpo), consultar la tarea eliminada (404 `TASK_NOT_FOUND`), id inválido (400), cuerpo vacío (422), `Content-Type` incorrecto (415), JSON mal formado (400) y ruta inexistente (404), además de la persistencia de las 5 tareas después de reiniciar la API. Todas dieron los mismos códigos que en A7, y las respuestas siguen sin `_id` ni `__v`.

## 10. ¿Qué limitación tiene la paginación basada en `skip` cuando la colección crece mucho?

`skip` obliga a MongoDB a recorrer y descartar todos los documentos anteriores a la página pedida, así que pedir `page=100000` es mucho más lento que `page=1`: el costo crece con el desplazamiento. Además, si se insertan o eliminan tareas mientras el cliente navega, las páginas se corren y pueden aparecer elementos repetidos u omitidos. Para colecciones grandes se prefiere la paginación por cursor (por ejemplo, filtrar por `_id` o `createdAt` mayor al último elemento visto). Para esta práctica `skip` es suficiente, y el límite de `page` en 100000 acota el costo.

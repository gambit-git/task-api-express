# Preguntas de cierre — EC1 F1 A2

## 1. ¿Cuál es la función de Node.js dentro de esta aplicación?

Node.js es el entorno de ejecución que permite correr JavaScript (y TypeScript ya compilado o ejecutado con `tsx`) fuera del navegador. En este proyecto ejecuta el servidor, lee las variables de entorno con `process.env`, resuelve los módulos ES y proporciona utilidades como `node:crypto`.

## 2. ¿Qué ventajas ofrece TypeScript frente a JavaScript?

TypeScript agrega tipado estático: errores como llamar una función con argumentos incorrectos o usar una propiedad inexistente se detectan con `pnpm check` antes de ejecutar el programa. Además mejora el autocompletado, documenta la forma de los datos (por ejemplo la interfaz `Task`) y facilita refactorizar. Para datos externos se usa `unknown` y se valida antes de usarlos, en lugar de `any`.

## 3. ¿Para qué sirven las importaciones y exportaciones?

Permiten dividir el código en módulos y compartir solo lo necesario. Cada archivo exporta sus funciones o tipos (`export const createTask`) y otros los importan (`import { createTask } from "../services/task.service.js"`). Así se evitan archivos gigantes, variables globales y dependencias ocultas. Con `NodeNext` las importaciones relativas llevan la extensión `.js`.

## 4. ¿Qué responsabilidad tiene cada módulo del proyecto?

- `models/`: define la forma de los datos (`Task`, `TaskStatus`).
- `data/`: almacena temporalmente las tareas en memoria.
- `services/`: contiene las reglas de negocio (crear, buscar, completar, eliminar).
- `errors/`: define `AppError`, que transporta estado HTTP y código del error.
- `utils/`: funciones auxiliares, como leer el nombre de la aplicación o simular una espera.
- `server.ts` / `app.ts`: puntos de entrada que arrancan y configuran la aplicación.

## 5. ¿Cuál es la diferencia entre una operación síncrona y una asíncrona?

Una operación síncrona bloquea la ejecución hasta terminar; la siguiente línea espera. Una asíncrona (leer un archivo, consultar una red o una base de datos, un temporizador) se inicia y el programa continúa; el resultado llega después mediante una promesa. Así el proceso no se queda detenido esperando.

## 6. ¿Para qué se utilizan `async` y `await`?

`async` marca una función que devuelve una promesa. `await` pausa esa función hasta que la promesa se resuelve y entrega el valor, o lanza el error si se rechaza. Permiten escribir código asíncrono con apariencia secuencial y manejar fallos con `try/catch`.

## 7. ¿Por qué las variables sensibles no deben escribirse directamente en el código?

Porque el código se sube a Git y puede ser visto por otras personas; una contraseña o URI publicada queda en el historial aunque se borre después. Se guardan en `.env` (ignorado por Git), se documentan en `.env.example` sin valores reales y se leen con `process.env`. También permite usar valores distintos por entorno sin cambiar el código.

## 8. ¿Qué errores controla la aplicación y cómo responde ante ellos?

- Título vacío o no textual al crear una tarea: lanza `AppError` de validación.
- Buscar una tarea inexistente: lanza `AppError` con `TASK_NOT_FOUND` (404).
- Completar o eliminar una tarea inexistente: mismo error 404.
- Fallos de operaciones asíncronas: se capturan con `try/catch` o con el manejador central de errores.

En todos los casos el error esperado se expresa con `AppError` y el cliente recibe un mensaje comprensible; los fallos inesperados devuelven un mensaje general sin detalles internos.

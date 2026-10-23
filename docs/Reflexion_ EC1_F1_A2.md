# Reflexión — EC1 F1 A2

**Nombre:** Gerard Andrei Hincapié Méndez  

## 1. ¿Cuál es la función de Node.js en este proyecto?

Node.js permite ejecutar JavaScript fuera del navegador. En este proyecto se utiliza para ejecutar la aplicación backend desde la terminal, trabajar con variables de entorno y ejecutar el código JavaScript generado después de compilar TypeScript.

Por ejemplo, cuando usamos `pnpm serve`, Node.js ejecuta el archivo `dist/index.js`.

## 2. ¿Qué errores ayuda a detectar TypeScript antes de ejecutar la aplicación?

TypeScript ayuda a detectar errores relacionados con los tipos de datos antes de ejecutar el programa.

Por ejemplo, puede advertir si intentamos asignar un texto donde debería ir un número, si falta una propiedad obligatoria de la interfaz `Task` o si intentamos utilizar un valor que puede ser `undefined`.

Esto ayuda a encontrar errores durante el desarrollo y no solamente cuando la aplicación ya está en ejecución.

## 3. ¿Por qué se separaron models, data, services y utils?

Se separaron para organizar mejor el proyecto y hacer que cada parte tenga una responsabilidad específica.

- `models` define la estructura de los datos, como la interfaz `Task`.
- `data` almacena las tareas en memoria.
- `services` contiene la lógica para crear, buscar, completar, eliminar y listar tareas.
- `utils` contiene funciones reutilizables, como `delay` y la lectura de `APP_NAME`.

Esta separación hace que el código sea más fácil de entender, modificar y mantener.

## 4. ¿Qué diferencia existe entre una función síncrona y una función async?

Una función síncrona ejecuta sus instrucciones en orden y devuelve su resultado directamente.

Una función `async` permite trabajar con operaciones que pueden tardar cierto tiempo y utiliza promesas. Con `await` se puede esperar el resultado de una promesa antes de continuar.

En este proyecto, `main` es una función `async` porque utiliza `await delay(300)`.

## 5. ¿Por qué findTaskById devuelve Task | undefined?

`findTaskById` devuelve `Task | undefined` porque existe la posibilidad de que la tarea buscada no exista.

Si encuentra una tarea con el identificador indicado devuelve un objeto `Task`. Si no encuentra ninguna, devuelve `undefined`.

Esto permite comprobar el resultado y manejar correctamente errores como intentar completar o eliminar una tarea inexistente.

## 6. ¿Qué ventaja aporta leer APP_NAME desde process.env?

Leer `APP_NAME` desde `process.env` permite cambiar el nombre de la aplicación sin modificar directamente el código fuente.

Por ejemplo, podemos ejecutar:

`$env:APP_NAME="Gestor de tareas UES"; pnpm start`

y la aplicación utilizará ese nombre en lugar de `Task Manager Backend`.

Esto permite separar la configuración del código y es útil en proyectos reales donde algunos valores pueden cambiar según el entorno.

## 7. ¿Qué diferencia observó entre pnpm start y la secuencia pnpm build + pnpm serve?

`pnpm start` ejecuta directamente el archivo TypeScript `src/index.ts` mediante TSX.

En cambio, `pnpm build` utiliza TypeScript para convertir los archivos `.ts` en archivos `.js` dentro de la carpeta `dist`.

Después, `pnpm serve` utiliza Node.js para ejecutar `dist/index.js`.

Los dos producen un resultado similar, pero `start` es más útil durante el desarrollo y `build + serve` permite comprobar el funcionamiento del código ya compilado a JavaScript.

## 8. ¿Qué parte de este proyecto podrá reutilizarse cuando se construya la API con Express?

Se podrá reutilizar principalmente la lógica que ya se encuentra en `models`, `data` y `services`.

Por ejemplo, las funciones `listTasks`, `findTaskById`, `createTask`, `completeTask`, `deleteTask` y `listPendingTasks` ya contienen las operaciones para administrar las tareas.

Cuando se utilice Express, estas funciones podrán ser llamadas desde las rutas HTTP sin tener que volver a escribir la lógica principal del sistema.
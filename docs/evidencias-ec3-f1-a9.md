# Evidencias EC3 F1 A9

## Datos generales

- Nombre:
- Grupo:
- Repositorio y rama: https://github.com/gambit-git/task-api-express, rama `ec3-a9-auth`
- Commit final:

## Entorno verificado

- `node --version`: v26.13.1
- `pnpm --version`: 12.9.1
- `pnpm check`: aprobado
- `pnpm lint`: aprobado
- `pnpm build`: aprobado
- `pnpm test`: 15 pruebas aprobadas, 0 fallidas
- `GET /health/database`: 200

Versiones: la actividad indica Express 5.1.0 y Mongoose 8.24.4. Se conservaron las versiones del proyecto de la A8 (Express `^5.2.1` y Mongoose `^8.24.5`). Dependencias nuevas: `bcryptjs` 3.0.3 y `jose` 6.2.12.

## Registro

Solicitud: `POST /api/auth/register`

```json
{
  "name": "Ana Torres",
  "email": "<CORREO_DE_PRUEBA>",
  "password": "<OCULTA>",
  "confirmPassword": "<OCULTA>"
}
```

- Código HTTP:
- Respuesta esperada: `data.user` con `id`, `name`, `email`, `role`, `createdAt` y `updatedAt`.
- ¿Aparece `passwordHash` en la respuesta?:

## Inicio de sesión

Solicitud: `POST /api/auth/login`

```json
{
  "email": "<CORREO_DE_PRUEBA>",
  "password": "<OCULTA>"
}
```

- Código HTTP:
- Campos esperados: `user`, `accessToken` (`<TOKEN_OCULTO>`), `tokenType` y `expiresIn`.
- Claims del token: `sub`, `role`, `iss`, `aud`, `iat` y `exp`.

## Pruebas negativas

| Caso                             | Código esperado | Código obtenido | `error.code` | Resultado |
| -------------------------------- | --------------: | --------------: | ------------ | --------- |
| N1 Correo repetido               |             409 |                 |              |           |
| N2 Contraseña corta              |             422 |                 |              |           |
| N3 Contraseña de más de 72 bytes |             422 |                 |              |           |
| N4 Campo `role`                  |             422 |                 |              |           |
| N5 Campo adicional               |             422 |                 |              |           |
| N6 `confirmPassword` distinta    |             422 |                 |              |           |
| N7 Contraseña incorrecta         |             401 |                 |              |           |
| N8 Correo inexistente            |             401 |                 |              |           |
| N9 Content-Type incorrecto       |             415 |                 |              |           |
| N10 JSON inválido                |             400 |                 |              |           |

## Regresión de tareas (sin encabezado Authorization)

| Caso                         | Código esperado | Código obtenido | Resultado |
| ---------------------------- | --------------: | --------------: | --------- |
| R1 Crear                     |             201 |                 |           |
| R2 Listar con paginación     |             200 |                 |           |
| R3 Actualizar                |             200 |                 |           |
| R4 Completar                 |             200 |                 |           |
| R5 Filtrar, buscar y ordenar |             200 |                 |           |
| R6 Eliminar                  |             204 |                 |           |
| R7 Consultar tarea eliminada |             404 |                 |           |

Colección de Postman: `postman/postman_collections/Task-API-EC3-F1-A9.postman_collection.json`.

## Desafío confirmPassword

`confirmPassword` se comprueba en el middleware que valida la petición HTTP. Si no coincide con `password`, la API responde `422 AUTH_VALIDATION_ERROR` con el campo `confirmPassword`. No forma parte de `RegisterInput`, del modelo, del repositorio ni de la respuesta, porque solo sirve para detectar errores de escritura al registrarse y, una vez comparada, no aporta información que deba guardarse.

## Seguridad observada

- ¿La colección guarda `password` o solo `passwordHash`?: solo `passwordHash` (bcrypt, 12 rondas). Comprobado en la colección `users` de Atlas.
- ¿Alguna respuesta expone `passwordHash`, URI, secreto o stack trace?:
- ¿El cliente puede asignarse `admin`?:

## Conclusión

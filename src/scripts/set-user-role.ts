import "dotenv/config";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { loadEnvironment } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { isUserRole } from "../models/user.js";
import { setUserRoleByEmail } from "../repositories/user.repository.js";

class ScriptError extends Error {}

const run = async (): Promise<void> => {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = process.argv[3]?.trim();

  if (!email || !isUserRole(role)) {
    throw new ScriptError("Uso: pnpm role:set <correo> <user|admin>");
  }

  const env = loadEnvironment();
  await connectDatabase({ uri: env.mongodbUri, dbName: env.mongodbDbName });

  const user = await setUserRoleByEmail(email, role);

  if (!user) {
    throw new ScriptError(`No existe un usuario con el correo ${email}.`);
  }

  console.log(`Rol actualizado: ${user.email} ahora es ${user.role}.`);
};

try {
  await run();
} catch (error: unknown) {
  const message =
    error instanceof ScriptError || error instanceof AppError
      ? error.message
      : "Revise las variables de .env y la lista de acceso de red.";

  console.error(`No fue posible actualizar el rol. ${message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}

import "dotenv/config";
import type { Server } from "node:http";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { loadEnvironment } from "./config/env.js";

const closeServer = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const registerShutdown = (server: Server): void => {
  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.log(`Señal ${signal} recibida. Cerrando la API...`);

    try {
      await closeServer(server);
      await disconnectDatabase();
      console.log("Servidor HTTP y conexión con MongoDB cerrados.");
    } catch {
      console.error("El cierre ordenado no terminó correctamente.");
      process.exitCode = 1;
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

const startServer = async (): Promise<void> => {
  try {
    const env = loadEnvironment();

    await connectDatabase({
      uri: env.mongodbUri,
      dbName: env.mongodbDbName,
    });

    const server = app.listen(env.port, () => {
      console.log(`API disponible en http://localhost:${env.port}`);
    });

    registerShutdown(server);
  } catch {
    console.error(
      "No fue posible iniciar la API. Revise MONGODB_URI, " +
        "el usuario y la lista de acceso de red.",
    );
    process.exitCode = 1;
  }
};

void startServer();

const MIN_JWT_SECRET_BYTES = 32;

const requireEnvironmentVariable = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }
  return value;
};

const readPort = (): number => {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT debe ser un entero positivo.");
  }
  return port;
};

const readJwtSecret = (): string => {
  const secret = requireEnvironmentVariable("JWT_SECRET");
  if (Buffer.byteLength(secret, "utf8") < MIN_JWT_SECRET_BYTES) {
    throw new Error("JWT_SECRET debe contener al menos 32 bytes.");
  }
  return secret;
};

const readJwtExpiration = (): string => {
  const value = process.env.JWT_EXPIRES_IN?.trim() || "1h";
  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error("JWT_EXPIRES_IN debe usar un formato como 15m, 1h o 7d.");
  }
  return value;
};

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}

export const loadJwtConfig = (): JwtConfig => {
  return {
    secret: readJwtSecret(),
    expiresIn: readJwtExpiration(),
    issuer: process.env.JWT_ISSUER?.trim() || "task-api-express",
    audience: process.env.JWT_AUDIENCE?.trim() || "task-api-client",
  };
};

export interface EnvironmentConfig {
  port: number;
  mongodbUri: string;
  mongodbDbName: string;
  jwt: JwtConfig;
}

export const loadEnvironment = (): EnvironmentConfig => {
  return {
    port: readPort(),
    mongodbUri: requireEnvironmentVariable("MONGODB_URI"),
    mongodbDbName: requireEnvironmentVariable("MONGODB_DB_NAME"),
    jwt: loadJwtConfig(),
  };
};

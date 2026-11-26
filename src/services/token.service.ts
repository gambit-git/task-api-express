import { SignJWT, jwtVerify } from "jose";

import { loadJwtConfig } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { isUserRole, type User } from "../models/user.js";
import type { AccessTokenSubject } from "../types/auth.js";

const JWT_ALGORITHM = "HS256";

const encodeSecret = (secret: string): Uint8Array =>
  new TextEncoder().encode(secret);

const invalidToken = (): AppError =>
  new AppError("El token no es válido o expiró.", 401, "INVALID_TOKEN");

export const createAccessToken = async (user: User): Promise<string> => {
  const { secret, expiresIn, issuer, audience } = loadJwtConfig();

  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodeSecret(secret));
};

export const verifyAccessToken = async (
  token: string,
): Promise<AccessTokenSubject> => {
  const { secret, issuer, audience } = loadJwtConfig();

  try {
    const { payload } = await jwtVerify(token, encodeSecret(secret), {
      issuer,
      audience,
      algorithms: [JWT_ALGORITHM],
      requiredClaims: ["sub", "exp"],
    });

    if (typeof payload.sub !== "string" || !isUserRole(payload.role)) {
      throw invalidToken();
    }

    return { userId: payload.sub, role: payload.role };
  } catch {
    throw invalidToken();
  }
};

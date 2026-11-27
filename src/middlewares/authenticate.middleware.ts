import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import { verifyAccessToken } from "../services/token.service.js";

const getBearerToken = (authorization: string | undefined): string => {
  if (!authorization) {
    throw new AppError(
      "Debes enviar un token de acceso.",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const [scheme, token, ...rest] = authorization.trim().split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
    throw new AppError(
      "El encabezado Authorization debe usar el formato Bearer <token>.",
      401,
      "INVALID_AUTHORIZATION_HEADER",
    );
  }

  return token;
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = getBearerToken(req.header("authorization"));

  res.locals.auth = await verifyAccessToken(token);
  next();
};

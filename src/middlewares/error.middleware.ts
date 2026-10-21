import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import type { ApiErrorPayload } from "../types/api-error.js";

const isInvalidJson = (error: unknown): boolean =>
  error instanceof SyntaxError && "status" in error && error.status === 400;

const sendError = (
  res: Response,
  status: number,
  payload: ApiErrorPayload,
): void => {
  res.status(status).json({ error: payload });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestId = res.locals.requestId as string | undefined;

  if (error instanceof AppError) {
    sendError(res, error.statusCode, {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
    });
    return;
  }

  if (isInvalidJson(error)) {
    sendError(res, 400, {
      code: "INVALID_JSON",
      message: "El cuerpo contiene JSON inválido.",
      requestId,
    });
    return;
  }

  console.error({ requestId, error });

  sendError(res, 500, {
    code: "INTERNAL_ERROR",
    message: "Ocurrió un error interno.",
    requestId,
  });
};

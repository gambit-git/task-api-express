import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";

const invalidData = (message: string): AppError =>
  new AppError(
    "La solicitud contiene datos inválidos.",
    422,
    "VALIDATION_ERROR",
    [{ field: "description", message }],
  );

export const validateDescription = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const description: unknown = req.body?.description;

  if (description === undefined || description === null) {
    next();
    return;
  }

  if (typeof description !== "string") {
    next(invalidData("Debe ser texto."));
    return;
  }

  const trimmed = description.trim();

  if (trimmed.length > 300) {
    next(invalidData("No debe superar 300 caracteres."));
    return;
  }

  if (trimmed) {
    res.locals.description = trimmed;
  }

  next();
};

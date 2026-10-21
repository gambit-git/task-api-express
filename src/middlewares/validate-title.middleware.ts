import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";

const invalidData = (message: string): AppError =>
  new AppError(
    "La solicitud contiene datos inválidos.",
    422,
    "VALIDATION_ERROR",
    [{ field: "title", message }],
  );

export const validateTitle = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const title: unknown = req.body?.title;

  if (typeof title !== "string" || !title.trim()) {
    next(invalidData("Debe ser texto no vacío."));
    return;
  }

  if (title.trim().length > 120) {
    next(invalidData("No debe superar 120 caracteres."));
    return;
  }

  res.locals.title = title.trim();

  next();
};

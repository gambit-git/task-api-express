import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";
import type { FieldIssue } from "../types/api-error.js";
import {
  MAX_PASSWORD_BYTES,
  MIN_PASSWORD_CHARACTERS,
  type LoginInput,
  type RegisterInput,
} from "../types/auth.js";

const REGISTER_FIELDS = new Set([
  "name",
  "email",
  "password",
  "confirmPassword",
]);

const LOGIN_FIELDS = new Set(["email", "password"]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validationError = (issues: FieldIssue[]): AppError =>
  new AppError(
    "Los datos de autenticación no son válidos.",
    422,
    "AUTH_VALIDATION_ERROR",
    issues,
  );

const bodyError = (): AppError =>
  validationError([{ field: "body", message: "Debe ser un objeto JSON." }]);

const checkAllowedFields = (
  body: Record<string, unknown>,
  allowedFields: Set<string>,
  issues: FieldIssue[],
): void => {
  for (const field of Object.keys(body)) {
    if (!allowedFields.has(field)) {
      issues.push({ field, message: "El campo no está permitido." });
    }
  }
};

const readName = (value: unknown, issues: FieldIssue[]): string => {
  const name = typeof value === "string" ? value.trim() : "";

  if (name.length < 2 || name.length > 80) {
    issues.push({
      field: "name",
      message: "Debe ser texto de 2 a 80 caracteres.",
    });
  }

  return name;
};

const readEmail = (value: unknown, issues: FieldIssue[]): string => {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    issues.push({
      field: "email",
      message: "Debe ser un correo electrónico válido.",
    });
  }

  return email;
};

const readPassword = (value: unknown, issues: FieldIssue[]): string => {
  if (typeof value !== "string" || value.length === 0) {
    issues.push({ field: "password", message: "Debe ser texto no vacío." });
    return "";
  }

  if (Buffer.byteLength(value, "utf8") > MAX_PASSWORD_BYTES) {
    issues.push({
      field: "password",
      message: `No debe superar ${MAX_PASSWORD_BYTES} bytes en UTF-8.`,
    });
  }

  return value;
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const body: unknown = req.body;

  if (!isRecord(body)) {
    next(bodyError());
    return;
  }

  const issues: FieldIssue[] = [];
  checkAllowedFields(body, REGISTER_FIELDS, issues);

  const input: RegisterInput = {
    name: readName(body.name, issues),
    email: readEmail(body.email, issues),
    password: readPassword(body.password, issues),
  };
  const length = Array.from(input.password).length;

  if (length > 0 && length < MIN_PASSWORD_CHARACTERS) {
    issues.push({
      field: "password",
      message: `Debe tener ${MIN_PASSWORD_CHARACTERS} caracteres o más.`,
    });
  }

  if (body.confirmPassword !== input.password) {
    issues.push({
      field: "confirmPassword",
      message: "Debe coincidir con password.",
    });
  }

  if (issues.length > 0) {
    next(validationError(issues));
    return;
  }

  res.locals.registerInput = input;
  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const body: unknown = req.body;

  if (!isRecord(body)) {
    next(bodyError());
    return;
  }

  const issues: FieldIssue[] = [];
  checkAllowedFields(body, LOGIN_FIELDS, issues);

  const input: LoginInput = {
    email: readEmail(body.email, issues),
    password: readPassword(body.password, issues),
  };

  if (issues.length > 0) {
    next(validationError(issues));
    return;
  }

  res.locals.loginInput = input;
  next();
};

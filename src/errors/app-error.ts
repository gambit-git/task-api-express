import type { FieldIssue } from "../types/api-error.js";

export type ErrorCode =
  | "INVALID_ID"
  | "INVALID_JSON"
  | "TASK_NOT_FOUND"
  | "ROUTE_NOT_FOUND"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    public readonly details?: FieldIssue[],
  ) {
    super(message);
    this.name = "AppError";
  }
}

/// <reference types="node" />

import assert from "node:assert/strict";
import { test } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../src/errors/app-error.js";
import { validateDescription } from "../src/middlewares/validate-description.middleware.js";
import { validateId } from "../src/middlewares/validate-id.middleware.js";
import { TaskModel } from "../src/models/task.js";

const run = (
  middleware: (
    req: Request,
    res: Response,
    next: NextFunction,
    value: string,
  ) => void,
  body: unknown,
  value = "",
): { error: unknown; locals: Record<string, unknown> } => {
  const locals: Record<string, unknown> = {};
  let error: unknown;

  middleware(
    { body } as Request,
    { locals } as Response,
    (received?: unknown) => {
      error = received;
    },
    value,
  );

  return { error, locals };
};

test("the model applies defaults and trims text", () => {
  const task = new TaskModel({ title: "  Preparar la API  " });

  assert.equal(task.validateSync(), undefined);
  assert.equal(task.title, "Preparar la API");
  assert.equal(task.status, "pending");
});

test("the model rejects blank, long and invalid values", () => {
  assert.ok(new TaskModel({ title: "   " }).validateSync()?.errors.title);
  assert.ok(
    new TaskModel({ title: "a".repeat(121) }).validateSync()?.errors.title,
  );
  assert.ok(
    new TaskModel({ title: "ok", status: "otro" }).validateSync()?.errors
      .status,
  );
  assert.ok(
    new TaskModel({ title: "ok", description: "a".repeat(301) }).validateSync()
      ?.errors.description,
  );
});

test("description is optional", () => {
  assert.equal(new TaskModel({ title: "ok" }).validateSync(), undefined);
  assert.equal(
    new TaskModel({ title: "ok", description: "a".repeat(300) }).validateSync(),
    undefined,
  );
});

test("validateId accepts only 24-character hexadecimal ObjectIds", () => {
  const valid = run(validateId, {}, "507f1f77bcf86cd799439011");

  assert.equal(valid.error, undefined);
  assert.equal(valid.locals.taskId, "507f1f77bcf86cd799439011");

  for (const value of [
    "1",
    "abc",
    "507f1f77bcf86cd79943901",
    "zzzzzzzzzzzzzzzzzzzzzzzz",
  ]) {
    const result = run(validateId, {}, value);

    assert.ok(
      result.error instanceof AppError && result.error.code === "INVALID_ID",
      `debería rechazar ${value}`,
    );
  }
});

test("validateDescription handles missing, valid and too long values", () => {
  assert.equal(run(validateDescription, {}).error, undefined);
  assert.equal(
    run(validateDescription, { description: "  detalle  " }).locals.description,
    "detalle",
  );

  const tooLong = run(validateDescription, { description: "a".repeat(301) });

  assert.ok(
    tooLong.error instanceof AppError &&
      tooLong.error.code === "VALIDATION_ERROR",
  );
  assert.ok(run(validateDescription, { description: 5 }).error);
});

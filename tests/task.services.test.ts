/// <reference types="node" />

import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../src/errors/app-error.js";
import {
  completeTask,
  createTask,
  deleteTask,
  findTaskById,
  listTasks,
} from "../src/services/task.service.js";

test("supports the task lifecycle", () => {
  const task = createTask("  Preparar la API  ");

  try {
    assert.equal(task.title, "Preparar la API");
    assert.equal(task.status, "pending");
    assert.equal(findTaskById(task.id), task);
    assert.ok(listTasks().some((item) => item.id === task.id));
    assert.equal(completeTask(task.id).status, "completed");

    deleteTask(task.id);

    assert.throws(
      () => findTaskById(task.id),
      (error: unknown) =>
        error instanceof AppError && error.code === "TASK_NOT_FOUND",
    );
  } finally {
    if (listTasks().some((item) => item.id === task.id)) {
      deleteTask(task.id);
    }
  }
});

test("rejects a blank task title", () => {
  assert.throws(
    () => createTask("   "),
    (error: unknown) =>
      error instanceof AppError && error.code === "VALIDATION_ERROR",
  );
});

test("rejects operations on a missing task", () => {
  assert.throws(() => completeTask(999_999), /No existe una tarea/);
  assert.throws(() => deleteTask(999_999), /No existe una tarea/);
});

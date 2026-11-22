/// <reference types="node" />

import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../src/errors/app-error.js";
import { validateDescription } from "../src/middlewares/validate-description.middleware.js";
import { validateId } from "../src/middlewares/validate-id.middleware.js";
import { validatePriority } from "../src/middlewares/validate-priority.middleware.js";
import { validateTaskQuery } from "../src/middlewares/validate-task-query.middleware.js";
import { validateTaskUpdate } from "../src/middlewares/validate-task-update.middleware.js";
import { TaskModel } from "../src/models/task.js";
import { listTasks } from "../src/services/task.service.js";
import type { TaskListQuery } from "../src/types/task-query.js";

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

test("priority defaults to medium and accepts only low, medium and high", () => {
  assert.equal(new TaskModel({ title: "ok" }).priority, "medium");

  for (const priority of ["low", "medium", "high"]) {
    assert.equal(
      new TaskModel({ title: "ok", priority }).validateSync(),
      undefined,
    );
  }

  assert.ok(
    new TaskModel({ title: "ok", priority: "urgent" }).validateSync()?.errors
      .priority,
  );
});

test("validatePriority is optional and rejects unknown values", () => {
  assert.equal(run(validatePriority, {}).error, undefined);
  assert.equal(
    run(validatePriority, { priority: "high" }).locals.priority,
    "high",
  );

  const invalid = run(validatePriority, { priority: "urgent" });

  assert.ok(
    invalid.error instanceof AppError &&
      invalid.error.code === "VALIDATION_ERROR" &&
      invalid.error.details?.[0]?.field === "priority",
  );
});

test("validateTaskUpdate allows partial updates and rejects bad bodies", () => {
  const partial = run(validateTaskUpdate, { priority: "low" });

  assert.equal(partial.error, undefined);
  assert.deepEqual(partial.locals.taskUpdate, { priority: "low" });

  for (const body of [
    {},
    [],
    { owner: "Ana" },
    { createdAt: "x" },
    { title: " " },
    { title: "a".repeat(121) },
    { status: "archived" },
    { priority: "urgent" },
  ]) {
    const result = run(validateTaskUpdate, body);

    assert.ok(
      result.error instanceof AppError && result.error.statusCode === 422,
      `debería rechazar ${JSON.stringify(body)}`,
    );
  }
});

const DEFAULT_QUERY: TaskListQuery = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  order: "asc",
};

const runQuery = (
  query: Record<string, unknown>,
): { error: unknown; locals: Record<string, unknown> } => {
  const locals: Record<string, unknown> = {};
  let error: unknown;

  validateTaskQuery(
    { query } as unknown as Request,
    { locals } as Response,
    (received?: unknown) => {
      error = received;
    },
  );

  return { error, locals };
};

test("validateTaskQuery applies defaults and normalizes valid values", () => {
  assert.deepEqual(runQuery({}).locals.taskQuery, DEFAULT_QUERY);

  assert.deepEqual(
    runQuery({
      page: "2",
      limit: "5",
      status: "pending",
      search: "  api  ",
      sortBy: "title",
      order: "desc",
    }).locals.taskQuery,
    {
      page: 2,
      limit: 5,
      status: "pending",
      search: "api",
      sortBy: "title",
      order: "desc",
    },
  );
});

test("validateTaskQuery rejects unknown, repeated and invalid parameters", () => {
  const invalid: [Record<string, unknown>, string][] = [
    [{ page: "0" }, "page"],
    [{ page: "abc" }, "page"],
    [{ page: ["1", "2"] }, "page"],
    [{ page: { a: "1" } }, "page"],
    [{ page: "100001" }, "page"],
    [{ limit: "0" }, "limit"],
    [{ limit: "51" }, "limit"],
    [{ status: "archived" }, "status"],
    [{ search: "" }, "search"],
    [{ search: "   " }, "search"],
    [{ search: "a".repeat(61) }, "search"],
    [{ sortBy: "priority" }, "sortBy"],
    [{ order: "sideways" }, "order"],
    [{ owner: "ana" }, "owner"],
  ];

  for (const [query, field] of invalid) {
    const result = runQuery(query);

    assert.ok(
      result.error instanceof AppError &&
        result.error.statusCode === 422 &&
        result.error.code === "QUERY_VALIDATION_ERROR" &&
        result.error.details?.some((detail) => detail.field === field),
      `debería rechazar ${JSON.stringify(query)}`,
    );
  }

  assert.equal(
    runQuery({ page: "100000", limit: "50", search: "a".repeat(60) }).error,
    undefined,
  );
});

test("listTasks builds a safe query and a coherent meta", async () => {
  const calls: Record<string, unknown> = {};
  const find = mock.method(TaskModel, "find", (filter: unknown) => {
    calls.findFilter = filter;

    const chain = {
      sort: (sort: unknown) => {
        calls.sort = sort;
        return chain;
      },
      skip: (skip: unknown) => {
        calls.skip = skip;
        return chain;
      },
      limit: (limit: unknown) => {
        calls.limit = limit;
        return Promise.resolve([]);
      },
    };

    return chain;
  });
  const count = mock.method(TaskModel, "countDocuments", (filter: unknown) => {
    calls.countFilter = filter;
    return Promise.resolve(8);
  });

  try {
    const result = await listTasks({
      page: 2,
      limit: 5,
      status: "pending",
      search: ".*",
      sortBy: "title",
      order: "desc",
    });

    assert.deepEqual(calls.sort, { title: -1, _id: -1 });
    assert.equal(calls.skip, 5);
    assert.equal(calls.limit, 5);
    assert.deepEqual(calls.findFilter, calls.countFilter);

    const filter = calls.findFilter as {
      status: string;
      title: { $regex: RegExp };
    };

    assert.equal(filter.status, "pending");
    assert.equal(filter.title.$regex.source, "\\.\\*");
    assert.equal(filter.title.$regex.test("Revisar API"), false);
    assert.equal(filter.title.$regex.test("usa .* literal"), true);

    assert.deepEqual(result, {
      data: [],
      meta: {
        page: 2,
        limit: 5,
        total: 8,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
  } finally {
    find.mock.restore();
    count.mock.restore();
  }
});

test("listTasks reports an empty collection without neighbor pages", async () => {
  const find = mock.method(TaskModel, "find", () => {
    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: () => Promise.resolve([]),
    };

    return chain;
  });
  const count = mock.method(TaskModel, "countDocuments", () =>
    Promise.resolve(0),
  );

  try {
    const { meta } = await listTasks({ ...DEFAULT_QUERY, page: 3 });

    assert.equal(meta.total, 0);
    assert.equal(meta.totalPages, 0);
    assert.equal(meta.hasNextPage, false);
    assert.equal(meta.hasPreviousPage, false);
  } finally {
    find.mock.restore();
    count.mock.restore();
  }
});

test("a storage failure becomes 503 DATABASE_UNAVAILABLE without internals", async () => {
  const find = mock.method(TaskModel, "find", () => {
    const chain = {
      sort: () => chain,
      skip: () => chain,
      limit: () => Promise.reject(new Error("mongodb://usuario:secreto@host")),
    };

    return chain;
  });
  const count = mock.method(TaskModel, "countDocuments", () =>
    Promise.resolve(0),
  );

  try {
    await assert.rejects(listTasks(DEFAULT_QUERY), (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 503);
      assert.equal(error.code, "DATABASE_UNAVAILABLE");
      assert.ok(!error.message.includes("secreto"));
      return true;
    });
  } finally {
    find.mock.restore();
    count.mock.restore();
  }
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

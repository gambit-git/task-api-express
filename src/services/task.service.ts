import { tasks } from "../data/tasks.js";
import { AppError } from "../errors/app-error.js";
import type { Task } from "../models/task.js";

const titleError = (message: string): AppError =>
  new AppError(
    "La solicitud contiene datos inválidos.",
    422,
    "VALIDATION_ERROR",
    [{ field: "title", message }],
  );

function assertValidTitle(title: unknown): asserts title is string {
  if (typeof title !== "string" || !title.trim()) {
    throw titleError("Debe ser texto no vacío.");
  }

  if (title.trim().length > 120) {
    throw titleError("No debe superar 120 caracteres.");
  }
}

export const listTasks = (): readonly Task[] => tasks;

export const findTaskById = (id: number): Task => {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    throw new AppError(
      `No existe una tarea con el id ${id}.`,
      404,
      "TASK_NOT_FOUND",
    );
  }

  return task;
};

export const createTask = (title: unknown): Task => {
  assertValidTitle(title);

  const task: Task = {
    id: Math.max(0, ...tasks.map((item) => item.id)) + 1,
    title: title.trim(),
    status: "pending",
    createdAt: new Date(),
  };

  tasks.push(task);

  return task;
};

export const completeTask = (id: number): Task => {
  const task = findTaskById(id);

  task.status = "completed";

  return task;
};

export const deleteTask = (id: number): void => {
  const index = tasks.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new AppError(
      `No existe una tarea con el id ${id}.`,
      404,
      "TASK_NOT_FOUND",
    );
  }

  tasks.splice(index, 1);
};

export const updateTaskTitle = (id: number, title: unknown): Task => {
  assertValidTitle(title);

  const task = findTaskById(id);

  task.title = title.trim();

  return task;
};

export const unpdateTaskTitle = updateTaskTitle;

export const updateTaskStatus = (id: number, completed: boolean): Task => {
  const task = findTaskById(id);

  task.status = completed ? "completed" : "pending";

  return task;
};

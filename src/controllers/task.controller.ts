import type { Request, Response } from "express";

import {
  completeTask,
  createTask,
  deleteTask,
  findTaskById,
  listTasks,
  updateTaskStatus,
  updateTaskTitle,
} from "../services/task.service.js";

export const getTasks = (_req: Request, res: Response): void => {
  res.status(200).json({ data: listTasks() });
};

export const getTask = (_req: Request, res: Response): void => {
  res.status(200).json({ data: findTaskById(res.locals.taskId as number) });
};

export const postTask = (_req: Request, res: Response): void => {
  const task = createTask(res.locals.title as string);

  res.status(201).json({ data: task });
};

export const patchTaskComplete = (_req: Request, res: Response): void => {
  const task = completeTask(res.locals.taskId as number);

  res.status(200).json({ data: task });
};

export const patchTaskTitle = (_req: Request, res: Response): void => {
  const task = updateTaskTitle(
    res.locals.taskId as number,
    res.locals.title as string,
  );

  res.status(200).json({ data: task });
};

export const patchTaskStatus = (_req: Request, res: Response): void => {
  const task = updateTaskStatus(
    res.locals.taskId as number,
    res.locals.completed as boolean,
  );

  res.status(200).json({ data: task });
};

export const removeTask = (_req: Request, res: Response): void => {
  deleteTask(res.locals.taskId as number);

  res.status(204).send();
};

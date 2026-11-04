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

export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ data: await listTasks() });
};

export const getTask = async (_req: Request, res: Response): Promise<void> => {
  res
    .status(200)
    .json({ data: await findTaskById(res.locals.taskId as string) });
};

export const postTask = async (_req: Request, res: Response): Promise<void> => {
  const task = await createTask(
    res.locals.title as string,
    res.locals.description as string | undefined,
  );

  res.status(201).json({ data: task });
};

export const patchTaskComplete = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const task = await completeTask(res.locals.taskId as string);

  res.status(200).json({ data: task });
};

export const patchTaskTitle = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const task = await updateTaskTitle(
    res.locals.taskId as string,
    res.locals.title as string,
  );

  res.status(200).json({ data: task });
};

export const patchTaskStatus = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const task = await updateTaskStatus(
    res.locals.taskId as string,
    res.locals.completed as boolean,
  );

  res.status(200).json({ data: task });
};

export const removeTask = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  await deleteTask(res.locals.taskId as string);

  res.status(204).send();
};

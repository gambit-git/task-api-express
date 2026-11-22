import { Router } from "express";

import {
  getTask,
  getTasks,
  patchTask,
  patchTaskComplete,
  patchTaskStatus,
  postTask,
  removeTask,
} from "../controllers/task.controller.js";

import { requireJson } from "../middlewares/require-json.middleware.js";
import { validateId } from "../middlewares/validate-id.middleware.js";
import { validateCompleted } from "../middlewares/validate-completed.middleware.js";
import { validateDescription } from "../middlewares/validate-description.middleware.js";
import { validatePriority } from "../middlewares/validate-priority.middleware.js";
import { validateTaskUpdate } from "../middlewares/validate-task-update.middleware.js";
import { validateTitle } from "../middlewares/validate-title.middleware.js";

export const taskRouter = Router();

taskRouter.param("id", validateId);

taskRouter.get("/", getTasks);
taskRouter.get("/:id", getTask);
taskRouter.post(
  "/",
  requireJson,
  validateTitle,
  validateDescription,
  validatePriority,
  postTask,
);
taskRouter.patch("/:id", requireJson, validateTaskUpdate, patchTask);
taskRouter.patch("/:id/complete", patchTaskComplete);
taskRouter.patch(
  "/:id/status",
  requireJson,
  validateCompleted,
  patchTaskStatus,
);
taskRouter.delete("/:id", removeTask);

import { Router } from "express";

import {
  getTask,
  getTasks,
  patchTaskComplete,
  patchTaskStatus,
  patchTaskTitle,
  postTask,
  removeTask,
} from "../controllers/task.controller.js";

import { requireJson } from "../middlewares/require-json.middleware.js";
import { validateId } from "../middlewares/validate-id.middleware.js";
import { validateCompleted } from "../middlewares/validate-completed.middleware.js";
import { validateTitle } from "../middlewares/validate-title.middleware.js";

export const taskRouter = Router();

taskRouter.param("id", validateId);

taskRouter.get("/", getTasks);
taskRouter.get("/:id", getTask);
taskRouter.post("/", requireJson, validateTitle, postTask);
taskRouter.patch("/:id", requireJson, validateTitle, patchTaskTitle);
taskRouter.patch("/:id/complete", patchTaskComplete);
taskRouter.patch(
  "/:id/status",
  requireJson,
  validateCompleted,
  patchTaskStatus,
);
taskRouter.delete("/:id", removeTask);

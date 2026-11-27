import type { Request, Response } from "express";

import { loginUser, registerUser } from "../services/auth.service.js";
import type { LoginInput, RegisterInput } from "../types/auth.js";

export const postRegister = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const input = res.locals.registerInput as RegisterInput;

  res.status(201).json({ data: await registerUser(input) });
};

export const postLogin = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const input = res.locals.loginInput as LoginInput;

  res.status(200).json({ data: await loginUser(input) });
};

export const getMe = (_req: Request, res: Response): void => {
  res.status(200).json({ data: { identity: res.locals.auth } });
};

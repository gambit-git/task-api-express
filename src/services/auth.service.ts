import { randomUUID } from "node:crypto";

import { loadJwtConfig } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import type { User } from "../models/user.js";
import {
  createUserDocument,
  findUserDocumentByEmail,
  type UserDocument,
} from "../repositories/user.repository.js";
import type {
  LoginInput,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from "../types/auth.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { createAccessToken } from "./token.service.js";

const dummyPasswordHash = hashPassword(randomUUID());

const toUser = (document: UserDocument): User => ({
  id: document._id.toString(),
  name: document.name,
  email: document.email,
  role: document.role,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

export const registerUser = async (
  input: RegisterInput,
): Promise<RegisterResult> => {
  const email = input.email.trim().toLowerCase();
  const existing = await findUserDocumentByEmail(email);

  if (existing) {
    throw new AppError(
      "Ya existe una cuenta con ese correo electrónico.",
      409,
      "USER_EMAIL_EXISTS",
    );
  }

  const passwordHash = await hashPassword(input.password);
  const document = await createUserDocument({
    name: input.name,
    email,
    passwordHash,
    role: "user",
  });

  return { user: toUser(document) };
};

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const email = input.email.trim().toLowerCase();
  const document = await findUserDocumentByEmail(email, true);
  const passwordHash = document?.passwordHash ?? (await dummyPasswordHash);
  const isValid = await verifyPassword(input.password, passwordHash);

  if (!document || !isValid) {
    throw new AppError(
      "El correo o la contraseña son incorrectos.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const user = toUser(document);

  return {
    user,
    accessToken: await createAccessToken(user),
    tokenType: "Bearer",
    expiresIn: loadJwtConfig().expiresIn,
  };
};

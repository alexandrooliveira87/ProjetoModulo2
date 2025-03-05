import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export const verifyBranch = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user.profile !== "BRANCH") {
    throw new AppError("Acesso negado! Somente usuários FILIAL podem cadastrar produtos.", 403);
  }
  next();
};

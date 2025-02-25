import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.profile !== "ADMIN") {
    throw new AppError("Acesso negado! Apenas usuários ADMIN podem realizar essa ação.", 403);
  }
  next();
};


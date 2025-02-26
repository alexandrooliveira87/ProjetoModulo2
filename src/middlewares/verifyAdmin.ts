import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export interface AuthRequest extends Request {
  user?: { userId: number; profile: string };
}

const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError("Usuário não autenticado!", 401));
  }

  if (req.user.profile !== "ADMIN") {
    return next(new AppError("Acesso negado! Apenas usuários ADMIN podem realizar essa ação.", 403));
  }

  next();
};

export default verifyAdmin;

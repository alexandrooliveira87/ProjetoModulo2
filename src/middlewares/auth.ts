import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";

export interface AuthRequest extends Request {
  user?: { userId: number; profile: string };
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Cabeçalho de Autorização Recebido:", authHeader); // 🔹 Depuração

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Token não informado ou com formato incorreto."); // 🔹 Log de erro
      throw new AppError("Token não informado", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      console.error("Token vazio!"); // 🔹 Log de erro
      throw new AppError("Token inválido", 401);
    }

    const secret = process.env.JWT_SECRET || "santos";

    const decoded = jwt.verify(token, secret) as JwtPayload & { userId: number; profile: string };

    req.user = {
      userId: decoded.userId,
      profile: decoded.profile
    };

    console.log("Token decodificado com sucesso:", req.user); // 🔹 Log de depuração

    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error.message); // 🔹 Log detalhado
    next(new AppError("Token inválido ou expirado", 401));
  }
};

export default verifyToken;

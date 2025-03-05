import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

type dataJwt = JwtPayload & { userId: string };

export interface AuthRequest extends Request {
  userId: string;
  user?: User; // 🔹 Adicionando o usuário completo ao request
}


export const verifyToken = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";

    if (!token) {
      throw new AppError("Token não informado", 401);
    }

    const data = jwt.verify(token, process.env.JWT_SECRET ?? "") as dataJwt;

    req.userId = data.userId;

    // 🔹 Buscando o usuário no banco para adicionar ao request
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: parseInt(req.userId) } });

    if (!user) {
      throw new AppError("Usuário não encontrado!", 403);
    }

    req.user = user; // 🔹 Adicionando o usuário autenticado ao request

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 401));
    } else {
      next(new AppError("Erro desconhecido", 401));
    }
  }
};

export default verifyToken;

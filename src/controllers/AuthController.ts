import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

class AuthController {
  private userRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email e senha são obrigatórios!", 400);
      }

      const user = await this.userRepository.findOne({
        where: { email },
        select: ["id", "profile", "email", "password_hash"],
      });

      if (!user) {
        throw new AppError("Email ou senha inválidos!", 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError("Email ou senha inválidos!", 401);
      }

      const token = jwt.sign(
        { userId: user.id, profile: user.profile },
        process.env.JWT_SECRET || "santos",
        { expiresIn: "1h" } // 🔹 Expiração do token corrigida
      );

      res.status(200).json({ token, name: user.email, profile: user.profile });
    } catch (error: any) {
      console.error("Erro no login:", error); // 🔹 Log para depuração

      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erro interno no servidor" });
      }
    }
  };
}

export default AuthController;

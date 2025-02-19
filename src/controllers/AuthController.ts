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

      // Buscar usuário garantindo que buscamos o `password_hash`
      const user = await this.userRepository.findOne({
        where: { email },
        select: ["id", "profile", "email", "password_hash"], // Certifique-se de que está pegando "password_hash"
      });

      if (!user) {
        throw new AppError("Email ou senha inválidos!", 400);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError("Email ou senha inválidos!", 400);
      }

      const token = jwt.sign(
        { userId: user.id, profile: user.profile },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  };
}

export default AuthController;

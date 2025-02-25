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
    this.login = this.login.bind(this); // 🔹 Corrige problemas com `this`
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // 🔹 Erro 400 - Campos obrigatórios não preenchidos
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios!" });
      }

      // 🔹 Busca o usuário no banco, incluindo `password_hash`
      const user = await this.userRepository.findOne({
        where: { email },
        select: ["id", "name", "profile", "email", "password_hash"],
      });

      // 🔹 Erro 401 - Usuário não encontrado
      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos!" });
      }

      // 🔹 Compara a senha digitada com o hash no banco
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Email ou senha inválidos!" });
      }

      // 🔹 Gera o token JWT
      const token = jwt.sign(
        { userId: user.id, profile: user.profile },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1h" }
      );

      // 🔹 Sucesso 200 - Retorna token, nome e perfil do usuário
      return res.status(200).json({
        token,
        name: user.name,
        profile: user.profile,
      });

    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
}

export default AuthController;

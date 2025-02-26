import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";

class UserController {
  private userRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);

    // 🔹 Garante que os métodos mantenham o contexto correto
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, profile, email, password } = req.body;

      if (!name || !profile || !email || !password) {
        throw new AppError("Todos os campos obrigatórios devem ser preenchidos.", 400);
      }

      if (!["DRIVER", "BRANCH", "ADMIN"].includes(profile)) {
        throw new AppError("Perfil inválido! Use DRIVER, BRANCH ou ADMIN.", 400);
      }

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError("Email já cadastrado!", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        name,
        profile,
        email,
        password_hash: hashedPassword,
        status: true,
      });

      await this.userRepository.save(user);

      res.status(201).json({ message: "Usuário criado com sucesso!" });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userRepository.find({
        select: ["id", "name", "status", "profile"],
      });

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;

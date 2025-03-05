import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Driver } from "../entities/Driver";
import AppError from "../utils/AppError";

class UserController {
  private userRepository;
  private driverRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.driverRepository = AppDataSource.getRepository(Driver);
  }

  // 🔹 Método para buscar um usuário por ID (ADMIN ou próprio MOTORISTA)
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const authenticatedUser = await this.userRepository.findOne({ where: { id: userId } });

      if (!authenticatedUser) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      if (authenticatedUser.profile !== "ADMIN") {
        const isDriver = await this.driverRepository.findOne({ where: { user: { id: userId } } });

        if (!isDriver || userId !== parseInt(id)) {
          throw new AppError("Acesso negado!", 401);
        }
      }

      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) },
        select: ["id", "name", "status", "profile"],
      });

      if (!user) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  // 🔹 Método para listar todos os usuários (Somente ADMIN)
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authenticatedUser = await this.userRepository.findOne({ where: { id: req.userId } });

      if (!authenticatedUser || authenticatedUser.profile !== "ADMIN") {
        throw new AppError("Acesso negado!", 401);
      }

      const { profile } = req.query;
      const whereCondition = profile ? { profile: profile as string } : {};

      const users = await this.userRepository.find({
        where: whereCondition,
        select: ["id", "name", "status", "profile"],
      });

      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;

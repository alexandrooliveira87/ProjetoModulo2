import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";

class UserController {
  private userRepository;
  private driverRepository;
  private branchRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.driverRepository = AppDataSource.getRepository(Driver);
    this.branchRepository = AppDataSource.getRepository(Branch);

    // 🔹 Vinculando métodos para evitar problemas de escopo
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  // 🔹 Listar todos os usuários (Somente ADMIN)
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
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
  }

  // 🔹 Buscar um usuário por ID (ADMIN ou próprio MOTORISTA)
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const authenticatedUser = await this.userRepository.findOne({ where: { id: userId } });

      if (!authenticatedUser) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      if (authenticatedUser.profile !== "ADMIN" && userId !== parseInt(id)) {
        throw new AppError("Acesso negado!", 401);
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
  }

  // 🔹 Atualizar um usuário (ADMIN ou próprio MOTORISTA)
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, password, full_address } = req.body;
      const userId = req.userId;

      const authenticatedUser = await this.userRepository.findOne({ where: { id: userId } });

      if (!authenticatedUser) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      const userToUpdate = await this.userRepository.findOne({ where: { id: parseInt(id) } });

      if (!userToUpdate) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      if (authenticatedUser.profile !== "ADMIN" && userId !== parseInt(id)) {
        throw new AppError("Acesso negado!", 401);
      }

      // 🔹 Impedir atualização de campos protegidos
      if (req.body.id || req.body.created_at || req.body.updated_at || req.body.status || req.body.profile) {
        throw new AppError("Não é permitido atualizar id, created_at, updated_at, status ou profile!", 401);
      }

      // 🔹 Verificar se o email já existe antes de atualizar
      if (email && email !== userToUpdate.email) {
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
          throw new AppError("Este email já está em uso!", 409);
        }
        userToUpdate.email = email;
      }

      if (name) userToUpdate.name = name;
      if (password) userToUpdate.password_hash = await bcrypt.hash(password, 10);

      // 🔹 Atualiza endereço se for DRIVER
      if (userToUpdate.profile === "DRIVER" && full_address) {
        let driver = await this.driverRepository.findOne({ where: { user: { id: userToUpdate.id } } });

        if (!driver) {
          driver = this.driverRepository.create({ user: userToUpdate, full_address });
        } else {
          driver.full_address = full_address;
        }
        await this.driverRepository.save(driver);
      }

      // 🔹 Atualiza endereço se for BRANCH
      if (userToUpdate.profile === "BRANCH" && full_address) {
        let branch = await this.branchRepository.findOne({ where: { user: { id: userToUpdate.id } } });

        if (!branch) {
          branch = this.branchRepository.create({ user: userToUpdate, full_address });
        } else {
          branch.full_address = full_address;
        }
        await this.branchRepository.save(branch);
      }

      // 🔹 Salva as alterações no banco
      await this.userRepository.save(userToUpdate);

      return res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        user: {
          id: userToUpdate.id,
          name: userToUpdate.name,
          email: userToUpdate.email,
          profile: userToUpdate.profile,
        },
      });

    } catch (error) {
      next(error);
    }
  }
}

export default UserController;

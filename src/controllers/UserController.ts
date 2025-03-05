import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";
import { isValidCPF, isValidCNPJ } from "../utils/validateDocuments";
class UserController {
  private userRepository;
  private driverRepository;
  private branchRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.driverRepository = AppDataSource.getRepository(Driver);
    this.branchRepository = AppDataSource.getRepository(Branch);

    // 🔹 Vinculando métodos para evitar problemas de escopo
    this.create = this.create.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateUserStatus = this.updateUserStatus.bind(this);
  }

  // 🔹 Criar um novo usuário
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, profile, email, password, document, full_address } = req.body;

      if (!name || !profile || !email || !password || !document) {
        throw new AppError("Todos os campos obrigatórios devem ser preenchidos.", 400);
      }

      if (!["DRIVER", "BRANCH", "ADMIN"].includes(profile)) {
        throw new AppError("Perfil inválido! Use DRIVER, BRANCH ou ADMIN.", 400);
      }

      // Verificar se o e-mail já existe
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError("Email já cadastrado!", 409);
      }

      // Validação de CPF e CNPJ
      if (profile === "DRIVER" && !isValidCPF(document)) {
        throw new AppError("CPF inválido!", 400);
      }
      if (profile === "BRANCH" && !isValidCNPJ(document)) {
        throw new AppError("CNPJ inválido!", 400);
      }

      // Criptografar a senha antes de salvar
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      const user = this.userRepository.create({
        name,
        profile,
        email,
        password_hash: hashedPassword,
        status: true,
      });

      await this.userRepository.save(user);

      // Se for DRIVER, criar na tabela drivers
      if (profile === "DRIVER") {
        const driver = this.driverRepository.create({
          document,
          full_address,
          user,
        });
        await this.driverRepository.save(driver);
      }

      // Se for BRANCH, criar na tabela branches
      if (profile === "BRANCH") {
        const branch = this.branchRepository.create({
          document,
          full_address,
          user,
        });
        await this.branchRepository.save(branch);
      }

      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        user: {
          id: user.id,
          name: user.name,
          profile: user.profile,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 🔹 Listar todos os usuários (Somente ADMIN)
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const authenticatedUser = await this.userRepository.findOne({ where: { id: req.body.userId } });

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
      const userId = req.body.userId;

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
      const userId = req.body.userId;

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

      if (email && email !== userToUpdate.email) {
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
          throw new AppError("Este email já está em uso!", 409);
        }
        userToUpdate.email = email;
      }

      if (name) userToUpdate.name = name;
      if (password) userToUpdate.password_hash = await bcrypt.hash(password, 10);

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

  // 🔹 Atualizar status do usuário (Somente ADMIN)
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.body.userId;

      const authenticatedUser = await this.userRepository.findOne({ where: { id: userId } });

      if (!authenticatedUser || authenticatedUser.profile !== "ADMIN") {
        throw new AppError("Acesso negado! Somente ADMIN pode alterar o status de usuários.", 401);
      }

      const userToUpdate = await this.userRepository.findOne({ where: { id: parseInt(id) } });
      if (!userToUpdate) {
        throw new AppError("Usuário não encontrado!", 404);
      }

      userToUpdate.status = !userToUpdate.status;
      await this.userRepository.save(userToUpdate);

      return res.status(200).json({
        message: "Status do usuário atualizado com sucesso!",
        user: {
          id: userToUpdate.id,
          name: userToUpdate.name,
          status: userToUpdate.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;

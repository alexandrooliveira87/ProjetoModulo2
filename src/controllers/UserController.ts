import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";
import { isValidCPF, isValidCNPJ } from "../utils/validateDocument";

class UserController {
  private userRepository;
  private branchRepository;
  private driverRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.driverRepository = AppDataSource.getRepository(Driver);
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, profile, email, password, document, full_address } = req.body;

      if (!name || !profile || !email || !password || !document) {
        throw new AppError("Todos os campos obrigatórios devem ser preenchidos.", 400);
      }

      if (!["DRIVER", "BRANCH", "ADMIN"].includes(profile)) {
        throw new AppError("Perfil inválido! Use DRIVER, BRANCH ou ADMIN.", 400);
      }

      // Validação de CPF e CNPJ
      if (profile === "DRIVER" && !isValidCPF(document)) {
        throw new AppError("CPF inválido!", 400);
      }
      if (profile === "BRANCH" && !isValidCNPJ(document)) {
        throw new AppError("CNPJ inválido!", 400);
      }

      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError("Email já cadastrado!", 409); // Alterado para 409 (Conflito)
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

      res.status(201).json({
        message: "Usuário criado com sucesso!",
        user: {
          name: user.name,
          profile: user.profile,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;

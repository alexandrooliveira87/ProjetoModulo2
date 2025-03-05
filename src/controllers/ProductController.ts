import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";
import AppError from "../utils/AppError";
import { AuthRequest } from "../middlewares/auth"; // Importando o tipo correto

class ProductController {
  private productRepository;
  private branchRepository;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.create = this.create.bind(this); // 🔹 Corrigindo o escopo do método
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, amount, description, url_cover } = req.body;

      if (!req.user) {
        throw new AppError("Usuário não autenticado!", 401);
      }

      if (req.user.profile !== "BRANCH") {
        throw new AppError("Acesso negado! Apenas usuários BRANCH podem cadastrar produtos.", 403);
      }

      const branch = await this.branchRepository.findOne({ where: { user: { id: req.user.id } } });

      if (!branch) {
        throw new AppError("Filial não encontrada para este usuário.", 404);
      }

      if (!name || !amount || !description) {
        throw new AppError("Os campos name, amount e description são obrigatórios.", 400);
      }

      const product = this.productRepository.create({
        name,
        amount,
        description,
        url_cover,
        branch,
      });

      await this.productRepository.save(product);

      return res.status(201).json({
        message: "Produto cadastrado com sucesso!",
        product,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;

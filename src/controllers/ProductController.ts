import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";
import AppError from "../utils/AppError";

class ProductController {
  private productRepository;
  private branchRepository;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
    this.branchRepository = AppDataSource.getRepository(Branch);

    this.createProduct = this.createProduct.bind(this);
    this.getAllProducts = this.getAllProducts.bind(this);
  }

  // 🔹 Criar Produto
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, amount, description, url_cover } = req.body;
      const userId = req.userId;

      if (!name || !amount || !description) {
        throw new AppError("Todos os campos obrigatórios devem ser preenchidos.", 400);
      }

      // 🔹 Encontrar a filial vinculada ao usuário logado
      const branch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!branch) {
        throw new AppError("Usuário não pertence a uma filial.", 403);
      }

      // 🔹 Criar novo produto vinculado à filial
      const newProduct = this.productRepository.create({
        name,
        amount,
        description,
        url_cover,
        branch, // 🔹 Associar o produto à filial do usuário
      });

      await this.productRepository.save(newProduct);

      return res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }

  // 🔹 Listar Produtos
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      // 🔹 Verificar se o usuário pertence a uma filial
      const branch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!branch) {
        throw new AppError("Acesso negado. Apenas filiais podem listar produtos.", 403);
      }

      // 🔹 Buscar todos os produtos da filial do usuário
      const products = await this.productRepository.find({
        where: { branch: { id: branch.id } },
        relations: ["branch"],
      });

      return res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  }
}

export default ProductController;

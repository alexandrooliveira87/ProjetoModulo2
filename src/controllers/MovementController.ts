import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Movement } from "../entities/Movement";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";
import AppError from "../utils/AppError";

class MovementController {
  private movementRepository;
  private productRepository;
  private branchRepository;

  constructor() {
    this.movementRepository = AppDataSource.getRepository(Movement);
    this.productRepository = AppDataSource.getRepository(Product);
    this.branchRepository = AppDataSource.getRepository(Branch);

    // 🔹 Vincular os métodos ao contexto correto
    this.createMovement = this.createMovement.bind(this);
  }

  async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { destination_branch_id, product_id, quantity } = req.body;
      const userId = req.userId;

      if (!destination_branch_id || !product_id || !quantity) {
        throw new AppError("Todos os campos são obrigatórios", 400);
      }

      if (quantity <= 0) {
        throw new AppError("A quantidade deve ser maior que zero", 400);
      }

      // 🔹 Verifica a filial do usuário (FILIAL)
      const userBranch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!userBranch) {
        throw new AppError("Usuário não está vinculado a uma filial", 403);
      }

      // 🔹 Verifica se o produto pertence à filial de origem
      const product = await this.productRepository.findOne({
        where: { id: product_id, branch: { id: userBranch.id } },
      });

      if (!product) {
        throw new AppError("Produto não encontrado na filial de origem", 404);
      }

      // 🔹 Verifica se a filial de destino é diferente da de origem
      if (userBranch.id === destination_branch_id) {
        throw new AppError(
          "A filial de origem não pode ser a mesma que a filial de destino",
          400
        );
      }

      // 🔹 Verifica se há estoque suficiente
      if (product.amount < quantity) {
        throw new AppError(
          "Estoque insuficiente para essa movimentação",
          400
        );
      }

      // 🔹 Atualiza o estoque da filial de origem
      product.amount -= quantity;
      await this.productRepository.save(product);

      // 🔹 Cria a movimentação
      const movement = this.movementRepository.create({
        destination_branch: { id: destination_branch_id },
        product,
        quantity,
        status: "PENDING",
      });

      await this.movementRepository.save(movement);

      return res.status(201).json({
        message: "Movimentação criada com sucesso!",
        movement,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default MovementController;

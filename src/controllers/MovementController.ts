import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Movement } from "../entities/Movement";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import AppError from "../utils/AppError";

class MovementController {
  private movementRepository;
  private productRepository;
  private branchRepository;
  private driverRepository;

  constructor() {
    this.movementRepository = AppDataSource.getRepository(Movement);
    this.productRepository = AppDataSource.getRepository(Product);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.driverRepository = AppDataSource.getRepository(Driver);

    this.createMovement = this.createMovement.bind(this);
    this.listMovements = this.listMovements.bind(this);
    this.startMovement = this.startMovement.bind(this);
    this.finishMovement = this.finishMovement.bind(this);
  }

  // 🔹 Criar Movimentação (Somente FILIAL)
  async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { destination_branch_id, product_id, quantity } = req.body;
      const userId = req.userId;

      const branch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!branch) {
        throw new AppError("Apenas FILIAIS podem criar movimentações!", 401);
      }

      const product = await this.productRepository.findOne({
        where: { id: product_id, branch: { id: branch.id } },
      });

      if (!product) {
        throw new AppError("Produto não encontrado na filial!", 404);
      }

      const destinationBranch = await this.branchRepository.findOne({
        where: { id: destination_branch_id },
      });

      if (!destinationBranch) {
        throw new AppError("Filial de destino não encontrada!", 404);
      }

      if (branch.id === destination_branch_id) {
        throw new AppError("A filial de origem não pode ser a mesma que a filial de destino!", 400);
      }

      if (quantity <= 0 || quantity > product.amount) {
        throw new AppError("Estoque insuficiente para essa movimentação!", 400);
      }

      product.amount -= quantity;
      await this.productRepository.save(product);

      const newMovement = this.movementRepository.create({
        destinationBranch: destinationBranch,
        product: product,
        quantity,
        status: "PENDING",
      });

      await this.movementRepository.save(newMovement);

      return res.status(201).json(newMovement);
    } catch (error) {
      next(error);
    }
  }

  // 🔹 Listar Movimentações (Somente FILIAL e MOTORISTA)
  async listMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;

      const branch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      const driver = await this.driverRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!branch && !driver) {
        throw new AppError("Acesso negado! Apenas FILIAL ou MOTORISTA podem visualizar movimentações.", 401);
      }

      const movements = await this.movementRepository.find({
        relations: ["destinationBranch", "product"],
        order: { created_at: "DESC" },
      });

      return res.status(200).json({ movements });
    } catch (error) {
      next(error);
    }
  }

  // 🔹 Iniciar Movimentação (Somente MOTORISTA)
  async startMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const driver = await this.driverRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!driver) {
        throw new AppError("Apenas MOTORISTAS podem iniciar uma movimentação!", 401);
      }

      const movement = await this.movementRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["destinationBranch", "product"],
      });

      if (!movement) {
        throw new AppError("Movimentação não encontrada!", 404);
      }

      movement.status = "IN_PROGRESS";
      movement.driver = driver;
      await this.movementRepository.save(movement);

      return res.status(200).json(movement);
    } catch (error) {
      next(error);
    }
  }

  // 🔹 Finalizar Movimentação (Somente MOTORISTA que iniciou)
  async finishMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const driver = await this.driverRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!driver) {
        throw new AppError("Apenas MOTORISTAS podem finalizar uma movimentação!", 401);
      }

      const movement = await this.movementRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["destinationBranch", "product", "driver"],
      });

      if (!movement) {
        throw new AppError("Movimentação não encontrada!", 404);
      }

      if (!movement.driver || movement.driver.id !== driver.id) {
        throw new AppError("Apenas o motorista que iniciou a movimentação pode finalizá-la!", 401);
      }

      movement.status = "FINISHED";
      await this.movementRepository.save(movement);

      // ✅ Criar novo produto na filial de destino
      const newProduct = this.productRepository.create({
        name: movement.product.name,
        amount: movement.quantity,
        description: movement.product.description,
        url_cover: movement.product.url_cover,
        branch: movement.destinationBranch,
      });

      await this.productRepository.save(newProduct);

      return res.status(200).json({ movement, newProduct });
    } catch (error) {
      next(error);
    }
  }
}

export default MovementController;

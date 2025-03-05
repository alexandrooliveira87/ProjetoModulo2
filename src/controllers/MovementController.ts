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
  }

  // 🔹 Criar Movimentação (Somente FILIAL)
  async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { destination_branch_id, product_id, quantity } = req.body;
      const userId = req.userId;

      // ✅ Verifica se o usuário pertence a uma filial
      const branch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!branch) {
        throw new AppError("Apenas FILIAIS podem criar movimentações!", 401);
      }

      // ✅ Verifica se o produto pertence à filial de origem
      const product = await this.productRepository.findOne({
        where: { id: product_id, branch: { id: branch.id } },
      });

      if (!product) {
        throw new AppError("Produto não encontrado na filial!", 404);
      }

      // ✅ Verifica se a filial de destino existe
      const destinationBranch = await this.branchRepository.findOne({
        where: { id: destination_branch_id },
      });

      if (!destinationBranch) {
        throw new AppError("Filial de destino não encontrada!", 404);
      }

      // ✅ Valida se a filial de destino é diferente da de origem
      if (branch.id === destination_branch_id) {
        throw new AppError("A filial de origem não pode ser a mesma que a filial de destino!", 400);
      }

      // ✅ Verifica se há estoque suficiente
      if (quantity <= 0 || quantity > product.amount) {
        throw new AppError("Estoque insuficiente para essa movimentação!", 400);
      }

      // ✅ Atualiza o estoque do produto na filial de origem
      product.amount -= quantity;
      await this.productRepository.save(product);

      // ✅ Cria a movimentação
      const newMovement = this.movementRepository.create({
        destinationBranch: destinationBranch, // ✅ Referência direta ao objeto
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

      // ✅ Verifica se o usuário tem permissão (FILIAL ou MOTORISTA)
      const branch = await this.branchRepository.findOne({
        where: { user: { id: userId } },
      });

      const driver = await this.driverRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!branch && !driver) {
        throw new AppError("Acesso negado! Apenas FILIAL ou MOTORISTA podem visualizar movimentações.", 401);
      }

      // ✅ Obtém todas as movimentações
      const movements = await this.movementRepository.find({
        relations: ["destinationBranch", "product"],
        order: { created_at: "DESC" },
      });

      return res.status(200).json({ movements });
    } catch (error) {
      next(error);
    }
  }

  // 🔹 Atualizar Status para "IN_PROGRESS" (Somente MOTORISTA)
  async startMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const driverId = req.userId; // ID do motorista autenticado

      // ✅ Verificar se o usuário é um MOTORISTA
      const driver = await this.driverRepository.findOne({ where: { user: { id: driverId } } });

      if (!driver) {
        throw new AppError("Apenas MOTORISTAS podem iniciar uma movimentação!", 403);
      }

      // ✅ Buscar a movimentação
      const movement = await this.movementRepository.findOne({ where: { id: parseInt(id) } });

      if (!movement) {
        throw new AppError("Movimentação não encontrada!", 404);
      }

      // ✅ Verificar se já foi iniciada
      if (movement.status !== "PENDING") {
        throw new AppError("Essa movimentação já foi iniciada!", 400);
      }

      // ✅ Atualizar status e atribuir motorista
      movement.status = "IN_PROGRESS";
      movement.driver = driver;
      await this.movementRepository.save(movement);

      return res.status(200).json({
        message: "Movimentação iniciada com sucesso!",
        movement
      });

    } catch (error) {
      next(error);
    }
  }
}

export default MovementController;

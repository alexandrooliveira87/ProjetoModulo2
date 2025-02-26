import { Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middlewares/auth";
import verifyAdmin from "../middlewares/verifyAdmin";

const userRouter = Router();
const userController = new UserController(); // 🔹 Criando a instância corretamente

// 🔹 Verifica se os métodos `create` e `list` existem
if (!userController.create || !userController.list) {
  throw new Error("UserController methods are undefined! Verifique se os métodos estão declarados corretamente.");
}

// 🔹 Rota de criação de usuário (Apenas ADMIN)
userRouter.post("/", verifyToken, verifyAdmin, (req, res, next) => {
  userController.create(req, res, next);
});

// 🔹 Rota de listagem de usuários (Apenas ADMIN)
userRouter.get("/", verifyToken, verifyAdmin, (req, res, next) => {
  userController.list(req, res, next);
});

export default userRouter;

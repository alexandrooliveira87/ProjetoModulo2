import { Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middlewares/auth";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/", userController.create); // 🔹 Adicionando a criação de usuários
userRouter.get("/", verifyToken, userController.getAllUsers);
userRouter.get("/:id", verifyToken, userController.getUserById);
userRouter.put("/:id", verifyToken, userController.updateUser);
userRouter.patch("/:id/status", verifyToken, userController.updateUserStatus);

export default userRouter;

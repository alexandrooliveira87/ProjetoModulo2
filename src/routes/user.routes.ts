import { Router } from "express";
import UserController from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/", userController.create); // 🔹 Certifique-se de que o método `create` está definido no UserController

export default userRouter;

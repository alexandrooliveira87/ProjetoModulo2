import { Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middlewares/auth";

const userRouter = Router();
const userController = new UserController();

userRouter.get("/", verifyToken, userController.getAllUsers);
userRouter.get("/:id", verifyToken, userController.getUserById);
userRouter.put("/:id", verifyToken, userController.updateUser);

export default userRouter;

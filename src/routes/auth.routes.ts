import { Router } from "express";
import AuthController from "../controllers/AuthController";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/", (req, res) => authController.login(req, res));

// 🔹 Rota de teste para verificar se o endpoint de login está funcionando
authRouter.get("/test", (req, res) => {
  res.send("Login endpoint está funcionando!");
});

export default authRouter;

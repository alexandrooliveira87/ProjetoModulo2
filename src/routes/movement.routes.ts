import { Router } from "express";
import MovementController from "../controllers/MovementController";
import verifyToken from "../middlewares/auth";

const movementRouter = Router();
const movementController = new MovementController();

movementRouter.post("/", verifyToken, movementController.createMovement);

export default movementRouter;

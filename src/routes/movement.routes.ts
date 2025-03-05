import { Router } from "express";
import MovementController from "../controllers/MovementController";
import verifyToken from "../middlewares/auth";

const movementRouter = Router();
const movementController = new MovementController();

movementRouter.post("/", verifyToken, movementController.createMovement);
movementRouter.get("/", verifyToken, movementController.listMovements);
movementRouter.patch("/:id/start", verifyToken, movementController.startMovement);

export default movementRouter;

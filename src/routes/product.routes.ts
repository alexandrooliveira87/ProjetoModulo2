import { Router } from "express";
import ProductController from "../controllers/ProductController";
import verifyToken from "../middlewares/auth";
import { verifyBranch } from "../middlewares/verifyBranch";


const productRouter = Router();
const productController = new ProductController();

productRouter.post("/", verifyToken, verifyBranch, productController.create);

export default productRouter;

import { Router } from "express";
import ProductController from "../controllers/ProductController";
import verifyToken from "../middlewares/auth";

const productRouter = Router();
const productController = new ProductController();

productRouter.post("/", verifyToken, productController.createProduct);
productRouter.get("/", verifyToken, productController.getAllProducts);

export default productRouter;

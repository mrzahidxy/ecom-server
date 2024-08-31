import { Router } from "express";
import { createProduct } from "../contrrollers/product";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleWare } from "../middleware/admin";

const productRoutes: Router = Router();

productRoutes.post("/", [authMiddleware, adminMiddleWare], createProduct);

export default productRoutes;

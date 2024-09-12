import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../contrrollers/product";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleWare } from "../middleware/admin";

const productRoutes: Router = Router();

productRoutes.post("/", [authMiddleware, adminMiddleWare], createProduct);
productRoutes.put("/:id", [authMiddleware, adminMiddleWare], updateProduct);
productRoutes.delete("/:id", [authMiddleware, adminMiddleWare], deleteProduct);
productRoutes.get("/:id", getProductById);
productRoutes.get("/", getProducts);

export default productRoutes;

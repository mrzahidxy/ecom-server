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

import multer from "multer";
import { storage } from "../config/cloudinary";
const upload = multer({ storage: storage });

const productRoutes: Router = Router();

productRoutes.post(
  "/",
  [authMiddleware, adminMiddleWare],
  upload.single("image"),
  createProduct
);
productRoutes.put(
  "/:id",
  [authMiddleware, adminMiddleWare],
  upload.single("image"),
  updateProduct
);
productRoutes.delete("/:id", [authMiddleware, adminMiddleWare], deleteProduct);
productRoutes.get("/:id", getProductById);
productRoutes.get("/", getProducts);

export default productRoutes;

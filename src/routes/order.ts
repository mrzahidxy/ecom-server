import { errorHandler } from "./../exceptions/error-handler";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getOrders,
  getUserOrder,
  updateOrderStatus,
} from "../contrrollers/order";
import { adminMiddleWare } from "../middleware/admin";

const orderRoutes: Router = Router();

orderRoutes.post("/", [authMiddleware], errorHandler(createOrder));
orderRoutes.put("/:id", [authMiddleware], errorHandler(cancelOrder));
orderRoutes.get("/:id", [authMiddleware], errorHandler(getOrderById));

// Admin Routes
orderRoutes.get(
  "/",
  [authMiddleware, adminMiddleWare],
  errorHandler(getOrders)
);

orderRoutes.get(
  "/users/:id",
  [authMiddleware],
  errorHandler(getUserOrder)
);
orderRoutes.put(
  "/status/:id",
  [authMiddleware, adminMiddleWare],
  errorHandler(updateOrderStatus)
);

export default orderRoutes;

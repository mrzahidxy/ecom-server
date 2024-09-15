import { errorHandler } from './../exceptions/error-handler';
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { cancelOrder, createOrder, getOrderById, getOrders } from '../contrrollers/order';

const orderRoutes: Router = Router();

orderRoutes.post("/", [authMiddleware], errorHandler(createOrder));
orderRoutes.put("/:id", [authMiddleware], errorHandler(cancelOrder));
orderRoutes.get("/:id", [authMiddleware], errorHandler(getOrderById));
orderRoutes.get("/", [authMiddleware], errorHandler(getOrders));

export default orderRoutes;

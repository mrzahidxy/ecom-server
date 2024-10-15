import { errorHandler } from './../exceptions/error-handler';
import { Router } from "express";
import { addToCart, changeQuantity, deleteCartItem, getCart } from "../contrrollers/cart";
import { authMiddleware } from "../middleware/auth";

const cartRoutes: Router = Router();

cartRoutes.post("/", [authMiddleware], errorHandler(addToCart));
cartRoutes.delete("/:id", [authMiddleware], errorHandler(deleteCartItem));
cartRoutes.put("/:id", [authMiddleware], errorHandler(changeQuantity));
cartRoutes.get("/", [authMiddleware], getCart);

export default cartRoutes;

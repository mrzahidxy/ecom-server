import { errorHandler } from "./../exceptions/error-handler";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

import { adminMiddleWare } from "../middleware/admin";
import { createPromotion, getPromotionById, getPromotions } from "../contrrollers/promotion";

const promotionRoutes: Router = Router();

promotionRoutes.post("/", [authMiddleware, adminMiddleWare], errorHandler(createPromotion));
promotionRoutes.get("/",  errorHandler(getPromotions));
promotionRoutes.get("/:id",  errorHandler(getPromotionById));



export default promotionRoutes;

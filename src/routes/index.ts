import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import addressRoutes from "./address";
import cartRoutes from "./cart";
import orderRoutes from "./order";
import userRoutes from "./users";
import promotionRoutes from "./promotions";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use('/products', productRoutes)
rootRouter.use('/addresses', addressRoutes)
rootRouter.use('/carts', cartRoutes)
rootRouter.use('/orders', orderRoutes)
rootRouter.use('/users', userRoutes)
rootRouter.use('/promotions', promotionRoutes)

export default rootRouter

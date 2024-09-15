import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import addressRoutes from "./address";
import cartRoutes from "./cart";
import orderRoutes from "./order";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use('/products', productRoutes)
rootRouter.use('/address', addressRoutes)
rootRouter.use('/cart', cartRoutes)
rootRouter.use('/order', orderRoutes)

export default rootRouter

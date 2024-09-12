import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import addressRoutes from "./address";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use('/products', productRoutes)
rootRouter.use('/address', addressRoutes)

export default rootRouter

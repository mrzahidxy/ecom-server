import { errorHandler } from './../exceptions/error-handler';
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createAddress, deleteAddress, getAddress, getAddressById, updateUser } from "../contrrollers/address";

const addressRoutes: Router = Router();

addressRoutes.post("/", [authMiddleware], errorHandler(createAddress));
addressRoutes.put("/", [authMiddleware], errorHandler(updateUser));
addressRoutes.delete("/:id", [authMiddleware], errorHandler(deleteAddress));
addressRoutes.get("/:id", [authMiddleware], errorHandler(getAddressById));
addressRoutes.get("/", [authMiddleware], errorHandler(getAddress));

export default addressRoutes;

import { errorHandler } from "./../exceptions/error-handler";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleWare } from "../middleware/admin";
import { getUserById, getUsers, updateUserRole } from "../contrrollers/users";

const userRoutes: Router = Router();

userRoutes.put(
  "/role",
  [authMiddleware, adminMiddleWare],
  errorHandler(updateUserRole)
);
userRoutes.get(
  "/",
  [authMiddleware, adminMiddleWare],
  errorHandler(getUsers)
);
userRoutes.get(
  "/:id",
  [authMiddleware, adminMiddleWare],
  errorHandler(getUserById)
);

export default userRoutes;

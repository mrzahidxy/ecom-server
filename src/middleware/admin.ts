import { NextFunction, Request, Response } from "express";

export const adminMiddleWare = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (user?.role === "ADMIN") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

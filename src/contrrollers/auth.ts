import { NextFunction, Request, Response } from "express";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../connect";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { SignUpSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";
import { JWT_SECRET } from "../secret";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const { name, email, password } = req.body;

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (user) {
    next(
      new BadRequestException(
        "User already exists",
        ErrorCode.UserAlreadyExists
      )
    );
  }

  user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
    },
  });

  const { password: userPassword, ...rest } = user;

  const response = new HTTPSuccessResponse("Signup successfully", 201, rest);
  res.status(response.statusCode).json(response);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    return next(
      new NotFoundException("No user found", ErrorCode.UserNotFound)
    );
  }

  if (!compareSync(password, user.password)) {
    return next(
      new BadRequestException("Wrong password", ErrorCode.IncorrectPassword)
    );
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

  const { password: userPassword, ...rest } = user;

  const response = new HTTPSuccessResponse("Login successfully", 201, {
    ...rest,
    token,
  });
  res.status(response.statusCode).json(response);
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json(new HTTPSuccessResponse("Unauthorized", 400));
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user?.id },
    include: { Address: true },
  });

  if (!user)
    return res.status(400).json(new HTTPSuccessResponse("Unauthorized", 400));

  const response = new HTTPSuccessResponse(
    "User fetched successfully",
    200,
    user
  );
  res.status(response.statusCode).json(response);
};

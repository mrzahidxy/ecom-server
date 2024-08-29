import { NextFunction, Request, Response } from "express";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../connect";
import { BadRequestException } from "../exceptions/bad-request";
import { ErrorCode } from "../exceptions/root";
import { UnprocessableEntityException } from "../exceptions/validation";
import { SignUpSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";

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
        ErrorCode.USER_ALREADY_EXITS
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

  res.json(user);
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
      new NotFoundException("No user found", ErrorCode.USER_NOT_FOUND)
    );
  }

  if (!compareSync(password, user.password)) {
    return next(
      new BadRequestException("Wrong password", ErrorCode.INCORRECT_PASSWORD)
    );
  }

  const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1d" });

  res.json({ user, token });
};

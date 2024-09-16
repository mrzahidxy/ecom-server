import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { updateUserRoleSchema } from "../schema/users";

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    skip: (req?.query?.skip && +req?.query.skip) || 0,
  });

  res.json({
    message: "success",
    data: users,
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: +req.params.id },
  });

  res.json({
    message: "success",
    data: user,
  });
};

export const updateUserRole = async (req: Request, res: Response) => {
    const validateData = updateUserRoleSchema.parse(req.body);
  try {
    const user = await prisma.user.update({
      where: { id: +req.params.id },
      data: {
        role: validateData?.role,
      },
    });
  } catch (error) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
};

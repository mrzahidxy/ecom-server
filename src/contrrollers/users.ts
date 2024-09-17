import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { updateUserRoleSchema } from "../schema/users";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    skip: (req?.query?.skip && +req?.query.skip) || 0,
  });

  const response = new HTTPSuccessResponse(
    "Users fetched successfully",
    200,
    users
  );
  res.status(response.statusCode).json(response);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: +req.params.id },
  });

  const response = new HTTPSuccessResponse(
    "User fetched successfully",
    200,
    user
  );
  res.status(response.statusCode).json(response);
};

export const updateUserRole = async (req: Request, res: Response) => {
  const validateData = updateUserRoleSchema.parse(req.body);
  try {
    await prisma.user.update({
      where: { id: +req.params.id },
      data: {
        role: validateData?.role,
      },
    });

    const response = new HTTPSuccessResponse(
      `User role updated successfully`,
      200
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
};

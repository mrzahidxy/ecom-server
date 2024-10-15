import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { updateUserRoleSchema } from "../schema/users";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    skip,
    take: limit,
  });

  // Get total number of orders
  const totalOrders = await prisma.order.count();

  // Prepare pagination metadata
  const totalPages = Math.ceil(totalOrders / limit);

  const response = new HTTPSuccessResponse("Users fetched successfully", 200, {
    collection: users,
    pagination: {
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    },
  });
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

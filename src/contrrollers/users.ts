import { Request, Response } from "express";
import prisma from "../connect";
import { updateUserRoleSchema } from "../schema/users";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  // Prepare pagination metadata
  const totalPages = Math.ceil(totalUsers / limit);

  const response = new HTTPSuccessResponse("Users fetched successfully", 200, {
    collection: users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers,
      limit,
    },
  });
  res.status(response.statusCode).json(response);
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(400)
      .json(new HTTPSuccessResponse("Invalid user id", 400));
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
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
};

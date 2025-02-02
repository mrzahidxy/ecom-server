import { Request, Response } from "express";
import prisma from "../connect";
import { ErrorCode } from "../exceptions/root";
import { AddressSchema, updateUserSchema } from "../schema/users";
import { BadRequestException } from "../exceptions/bad-request";
import { Address } from "@prisma/client";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { HTTPSuccessResponse } from "../helpers/success-response";

const findAddress = async (addressId: number, userId: number) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  return address;
};

export const createAddress = async (req: Request, res: Response) => {
  AddressSchema.parse(req.body);

  const address = await prisma.address.create({
    data: {
      ...req.body,
      userId: req?.user?.id,
    },
  });

  const response = new HTTPSuccessResponse(
    "Address created successfully",
    201,
    address
  );
  res.status(response.statusCode).json(response);
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const validateData = updateUserSchema.parse(req.body);
    const userId = Number(req?.user?.id);

    // Validate and retrieve addresses if provided
    let shippingAddress: Address | undefined;
    let billingAddress: Address | undefined;

    if (validateData.defaultShippingAddress) {
      shippingAddress =
        (await findAddress(validateData.defaultShippingAddress, userId)) ||
        undefined;
    }

    if (validateData.defaultBillingAddress) {
      billingAddress =
        (await findAddress(validateData.defaultBillingAddress, userId)) ||
        undefined;
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validateData,
        defaultShippingAddress: shippingAddress?.id,
        defaultBillingAddress: billingAddress?.id,
      },
    });

    const response = new HTTPSuccessResponse("User updated successfully", 201);
    res.status(response.statusCode).json(response);
  } catch (error) {
    throw new BadRequestException(
      "Error updating user",
      ErrorCode.UnprocessableEntity
    );
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  const addressId = Number(req.params.id);
  const userId = req.user?.id;

  // Find the address
  const address = await findAddress(addressId, userId!);

  if (address) {
    // Delete the address
    await prisma.address.delete({
      where: { id: addressId },
    });

    const response = new HTTPSuccessResponse(
      "Address deleted successfully",
      200
    );
    res.status(response.statusCode).json(response);
  } else {
    throw new UnauthorizedException(
      "Address not found or unauthorized",
      ErrorCode.AddressNotFound
    );
  }
};

export const getAddress = async (req: Request, res: Response) => {
  const address = await prisma.address.findMany({
    where: { userId: req?.user?.id },
  });

  const response = new HTTPSuccessResponse(
    "Address fetched successfully",
    200,
    address
  );
  res.status(response.statusCode).json(response);
};

export const getAddressById = async (req: Request, res: Response) => {
  const address = await prisma.address.findUnique({
    where: { id: Number(req.params.id) },
  });

  const response = new HTTPSuccessResponse(
    "Address fetched successfully",
    200,
    address
  );
  res.status(response.statusCode).json(response);
};

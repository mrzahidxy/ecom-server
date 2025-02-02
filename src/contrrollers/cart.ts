import { Product } from "@prisma/client";
import prisma from "../connect";
import { AddToCartSchema, changeQuantitySchema } from "../schema/cart";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Request, Response } from "express";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const addToCart = async (req: Request, res: Response) => {
  const validateData = AddToCartSchema.parse(req.body);

  let product: Product;

  try {
    product = await prisma.product.findFirstOrThrow({
      where: { id: validateData?.productId },
    });
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode?.ProductNotFound
    );
  }

  const existingCartItem = await prisma.cartItem.findFirst({
    where: { productId: validateData?.productId, userId: req.user?.id },
  });

  let cartItem;

  if (existingCartItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: existingCartItem?.id },
      data: {
        quantity: existingCartItem?.quantity + validateData?.quantity,
      },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        quantity: validateData?.quantity,
        productId: validateData?.productId,
        userId: req.user?.id!,
      },
    });
  }

  const response = new HTTPSuccessResponse(
    "Product added to cart successfully",
    201, cartItem
  );
  res.status(response.statusCode).json(response);
};

export const deleteCartItem = async (req: Request, res: Response) => {
  try {
    await prisma.cartItem.delete({
      where: { id: Number(req.params.id), userId: req.user?.id },
    });
  } catch (error) {
    throw new NotFoundException("Cart item not found", ErrorCode.NotAuthorized);
  }

  const response = new HTTPSuccessResponse(
    "Cart item deleted successfully",
    204
  );
  res.status(response.statusCode).json(response);
};

export const getCart = async (req: Request, res: Response) => {
  const cart = await prisma.cartItem.findMany({
    where: { userId: req.user?.id },
    include: { product: true },
  });

  const response = new HTTPSuccessResponse(
    "Cart fetched successfully",
    200,
    cart
  );
  res.status(response.statusCode).json(response);
};

export const changeQuantity = async (req: Request, res: Response) => {
  const validateData = changeQuantitySchema.parse(req.body);

  let cartItem;

  try {
    cartItem = await prisma.cartItem.findFirstOrThrow({
      where: { id: Number(req.params.id), userId: req.user?.id },
    });
  } catch (error) {
    throw new NotFoundException("Cart not found", ErrorCode?.CartNotFound);
  }

  await prisma.cartItem.update({
    where: { id: cartItem?.id },
    data: {
      quantity: validateData?.quantity,
    },
  });

  const response = new HTTPSuccessResponse(
    "Quantity updated successfully",
    200
  );
  res.status(response.statusCode).json(response);
};

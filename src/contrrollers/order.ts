import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Order } from "@prisma/client";

export const createOrder = async (req: Request, res: Response) => {
  return await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId: req.user?.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json("Cart is empty");
    }

    const price = cartItems.reduce((acc, item) => {
      return acc + item.quantity * +item.product.price;
    }, 0);

    const address = await tx.address.findFirst({
      where: { id: req.user?.defaultShippingAddress! },
    });

    const cartProducts = cartItems.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
      };
    });

    const order = await tx.order.create({
      data: {
        userId: req.user?.id!,
        netAmount: price,
        address: address?.formattedAddress!,
        products: {
          create: cartItems.map((item) => {
            return {
              productId: item.productId,
              quantity: item.quantity,
            };
          }),
        },
      },
    });

    const orderEvent = await tx.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });

    await tx.cartItem.deleteMany({
      where: { userId: req.user?.id },
    });

    res.json({
      order,
      orderEvent,
    });
  });
};

export const cancelOrder = async (req: Request, res: Response) => {
  let order: Order;
  try {
    order = await prisma.order.findFirstOrThrow({
      where: { id: +req.params.id, userId: req.user?.id },
      include: {
        products: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
        },
      });
    });

    res.json("Order cancelled");
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user?.id },
    include: {
      products: true,
    },
  });

  res.json(orders);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirstOrThrow({
    where: { id: +req.params.id, userId: req.user?.id },
    include: {
      products: true,
    },
  });

  res.json(order);
};

export const getUserOrder = async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user?.id },
    include: {
      products: true,
    },
  });

  res.json(createApiResponse(true, "Request successful", orders));
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  let order: Order;
  try {
    order = await prisma.order.findFirstOrThrow({
      where: { id: +req.params.id, userId: req.user?.id },
      include: {
        products: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: req.body.status,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: req.body.status,
        },
      });
    });

    res.json(createApiResponse(true, "Request successful", order));
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

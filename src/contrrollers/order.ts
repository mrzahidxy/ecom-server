import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { Order, PromotionType } from "@prisma/client";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const createOrder = async (req: Request, res: Response) => {
  return await prisma.$transaction(async (tx) => {
    const userId = req.user?.id;
    const defaultShippingAddressId = req.user?.defaultShippingAddress;

    // Find cart items for the current user
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { PromotionProduct: { include: { promotion: true } } }
        }
      },
    });

    // Check if the cart is empty
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Check if the user has a default shipping address
    if (!defaultShippingAddressId) {
      return res.status(400).json({
        message:
          "Default shipping address not set. Please set a default address.",
      });
    }

    // Query the database for the default shipping address
    const address = await tx.address.findFirst({
      where: { id: defaultShippingAddressId },
    });

    // Handle if the address is not found in the database
    if (!address) {
      return res.status(400).json({
        message:
          "Default shipping address not found. Please update your shipping address.",
      });
    }



    // Calculate the total price of the cart items
    const price = cartItems.reduce((acc, item) => {
      return acc + item.quantity * +item.product.price;
    }, 0);

    let totalDiscount = 0;

    cartItems.forEach((item) => {
      if (item.product.PromotionProduct && item.product.PromotionProduct.length > 0) {
        const activePromotion = item.product.PromotionProduct.find((p) => p.promotion.isActive && p.promotion.startDate <= new Date() && p.promotion.endDate >= new Date());

        if (activePromotion) {
          const promo = activePromotion.promotion;

          if (promo.type === PromotionType.PERCENTAGE && promo.discount) {
            totalDiscount += (item.quantity * +item.product.price) * (Number(promo?.discount) / 100);
          } if (promo.type === PromotionType.FIXED) {
            totalDiscount += Number(promo?.discount);
          } else if (promo.type === PromotionType.WEIGHTED) {

          }
        }
      }
    })




    //Create the order with the user's cart items and address
    const order = await tx.order.create({
      data: {
        userId: userId!,
        netAmount: price - totalDiscount,
        address: address.formattedAddress, // Using the found address
        products: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    // Create an order event
    const orderEvent = await tx.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });

    // Clear the user's cart after the order is placed
    await tx.cartItem.deleteMany({
      where: { userId },
    });

    // Return a successful response with the created order and event
    const response = new HTTPSuccessResponse(
      "Order created successfully",
      201,
      {
        order,
        orderEvent,
      }
    );
    res.status(response.statusCode).json(response);
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

    const response = new HTTPSuccessResponse(
      "Order cancelled successfully",
      200
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const getOrders = async (req: Request, res: Response) => {
  // Get page and limit from query params, with defaults
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const skip = (page - 1) * limit;

  const orders = await prisma.order.findMany({
    skip,
    take: limit,
    include: {
      products: true,
      user: true,
    },
  });

  // Get total number of orders
  const totalOrders = await prisma.order.count();

  // Prepare pagination metadata
  const totalPages = Math.ceil(totalOrders / limit);

  const response = new HTTPSuccessResponse("Orders fetched successfully", 200, {
    collection: orders,
    pagination: {
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    },
  });
  res.status(response.statusCode).json(response);
};

export const getOrderById = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirstOrThrow({
    where: { id: +req.params.id, userId: req.user?.id },
    include: {
      products: true,
    },
  });

  const response = new HTTPSuccessResponse(
    "Orders fetched successfully",
    200,
    order
  );
  res.status(response.statusCode).json(response);
};

export const getUserOrder = async (req: Request, res: Response) => {
  // Get page and limit from query params, with defaults
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const userId = req.user?.id;


  try {
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      where: userId ? { userId } : {},
      include: {
        products: true,
        user: true,
      },
    });

    // Get total number of orders
    const totalOrders = await prisma.order.count({ where: { userId } });

    // Prepare pagination metadata
    const totalPages = Math.ceil(totalOrders / limit);

    const response = new HTTPSuccessResponse(
      "Orders fetched successfully",
      200,
      {
        collection: orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          limit,
        },
      }
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.log(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  let order: Order;

  try {
    order = await prisma.order.findFirstOrThrow({
      where: { id: +req.params.id },
      include: {
        products: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
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
      const response = new HTTPSuccessResponse(
        "Order status updated successfully",
        200,
        updatedOrder
      );
      res.status(response.statusCode).json(response);
    });
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";

export const createProduct = async (req: Request, res: Response) => {

  try {
    // Check if an image file was uploaded
    const imageUrl = req.file ? req.file.path : null;

    // Construct the product data
    const productData = {
      ...req.body,
      image: imageUrl,
    };

    const product = await prisma.product.create({
      data: productData,
    });

    const response = new HTTPSuccessResponse(
      "Product created successfully",
      201,
      product
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    throw new NotFoundException(
      "INTERNAL EXCEPTION",
      ErrorCode?.INTERNAL_EXCEPTION
    );
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Check if an image file was uploaded
    const imageUrl = req.file ? req.file.path : null;

    // Construct the product data
    const productData = {
      ...req.body,
      image: imageUrl,
    };

    const updateProduct = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: productData,
    });

    const response = new HTTPSuccessResponse(
      "Product updated successfully",
      204,
      updateProduct
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode?.PRODUCT_NOT_FOUND
    );
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  await prisma.product.delete({
    where: { id: Number(req.params.id) },
  });

  const response = new HTTPSuccessResponse("Product deleted successfully", 204);
  res.status(response.statusCode).json(response);
};

export const getProducts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const tags = req.query.tags as string || ''


  const skip = (page - 1) * limit;

  const products = await prisma.product.findMany({
    where: tags ? {
      tags: {
        equals: tags,
      }
    } : {},
    skip,
    take: limit,
  })


  // Get total number of orders
  const totalOrders = await prisma.order.count();

  // Prepare pagination metadata
  const totalPages = Math.ceil(totalOrders / limit);

  const response = new HTTPSuccessResponse("Products fetched successfully", 200, {
    collection: products,
    pagination: {
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    },
  });
  res.status(response.statusCode).json(response);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include:{PromotionProduct: {include: {promotion: true}}},
  });
  
  const formattedProducts ={
    ...product,
    promotion: product?.PromotionProduct[0]?.promotion
  }


  const response = new HTTPSuccessResponse(
    "Product fetched successfully",
    200,
    formattedProducts
  );
  res.status(response.statusCode).json(response);
};

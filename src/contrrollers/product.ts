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
      204
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
  const product = await prisma.product.delete({
    where: { id: Number(req.params.id) },
  });

  const response = new HTTPSuccessResponse("Product deleted successfully", 204);
  res.status(response.statusCode).json(response);
};

export const getProducts = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const take = Number(req.query.limit) || 10;
  const skip = (page - 1) * take;

  const count = await prisma.product.count();
  const totalPages = Math.ceil(count / take);

  const products = await prisma.product.findMany({
    skip,
    take,
  });

  const response = new HTTPSuccessResponse(
    "Products fetched successfully",
    200,
    {
      currentPage: page,
      totalPages,
      perPage: take,
      totalProducts: count,
      data: products,
    }
  );
  res.status(response.statusCode).json(response);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  const response = new HTTPSuccessResponse(
    "Product fetched successfully",
    200,
    product
  );
  res.status(response.statusCode).json(response);
};

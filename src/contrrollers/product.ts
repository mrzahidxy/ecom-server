import { Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";

export const createProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.create({
    data: {
      ...req.body,
      tags: req?.body?.tags?.join(","),
    },
  });

  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updateProduct = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        ...req.body,
        tags: req?.body?.tags?.join(","),
      },
    });

    res.json(updateProduct);
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

  res.json(product);
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

  res.json({
    currentPage: page,
    totalPages,
    perPage: take,
    totalProducts: count,
    data: products,
  });
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  res.json(product);
};

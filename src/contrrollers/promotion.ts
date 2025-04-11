import { NextFunction, Request, Response } from "express";
import prisma from "../connect";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { HTTPSuccessResponse } from "../helpers/success-response";
import { PromotionSchema } from "../schema/promotion";
import { generateCode, handleValidationError } from "../helpers/common-method";

// Promotion CRUD Controllers

export const createPromotion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validateResult = PromotionSchema.safeParse(req.body);

    if (!validateResult.success) {
      return handleValidationError(res, validateResult);
    }

    const {
      title,
      startDate,
      endDate,
      type,
      discount,
      code,
      slabs,
      isActive,
      productIds,
    } = validateResult.data;

    // Validate that startDate is before endDate.
    if (new Date(startDate).getTime() >= new Date(endDate).getTime()) {
      throw new Error("Start date must be before the end date.");
    }

    // If productIds are provided, verify that they exist.
    if (productIds && productIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (existingProducts.length !== productIds.length) {
        throw new Error("One or more product IDs do not exist.");
      }
    }

    const promoCode = await generateCode();
    // Build the payload for promotion creation.
    const payload = {
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      code: promoCode ,
      type,
      discount,
      slabs: slabs ?? undefined,
      isActive,
      // Create join records only if productIds are provided.
      products: productIds && productIds.length > 0
        ? {
            create: productIds.map((productId) => ({
              product: { connect: { id: productId } },
              updatedAt: new Date(), // Corrected property name for the join table.
            })),
          }
        : undefined,
      updateAt: new Date(), // Ensure this matches your Promotion model field if applicable.
    };

    const promotion = await prisma.promotion.create({
      data: payload,
    });

    const response = new HTTPSuccessResponse(
      "Promotion created successfully",
      201,
      promotion
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};



// Get All Promotions
export const getPromotions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Fetch promotions based on the `enabled` status
  const promotions = await prisma.promotion.findMany({
    skip,
    take: Number(limit),
    where: {
      endDate: {
        gte: new Date(), // Exclude expired promotions
      },
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  // Count total promotions based on the `enabled` status
  const totalPromotions = await prisma.promotion.count({
    where: {
      endDate: {
        gte: new Date(),
      },
    },
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalPromotions / Number(limit));

  // Prepare the response payload
  const response = new HTTPSuccessResponse(
    "Promotions fetched successfully",
    200,
    {
      collection: promotions,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalPromotions,
        limit: Number(limit),
      },
    }
  );

  // Send the response
  res.status(response.statusCode).json(response);
};

export const getPromotionById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    let promotionId = Number(id);

    try {
        const promotion = await prisma.promotion.findFirstOrThrow({
            where: { id: promotionId },
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        const response = new HTTPSuccessResponse(
            "Promotion fetched successfully",
            200,
            promotion
        );
        res.status(response.statusCode).json(response);
    } catch (error) {
        throw new NotFoundException("Promotion not found", ErrorCode.PRODUCT_NOT_FOUND);
    }
};

// export const updatePromotion = async (
//     req: Request,
//     res: Response
// ): Promise<void> => {
//     const { id } = req.params;
//     const { title, startDate, endDate } = req.body;

//     try {
//         const promotion = await prisma.promotion.update({
//             where: { id },
//             data: {
//                 title,
//                 startDate: startDate ? new Date(startDate) : undefined,
//                 endDate: endDate ? new Date(endDate) : undefined,
//             },
//             include: {
//                 products: true,
//             },
//         });

//         const response = new HTTPSuccessResponse(
//             "Promotion updated successfully",
//             200,
//             promotion
//         );
//         res.status(response.statusCode).json(response);
//     } catch (error) {
//         throw new NotFoundException("Something went wrong", ErrorCode.PRODUCT_NOT_FOUND);
//     }
// };

// export const deletePromotion = async (
//     req: Request,
//     res: Response
// ): Promise<void> => {
//     const { id } = req.params;

//     try {
//         await prisma.promotion.delete({ where: { id } });

//         const response = new HTTPSuccessResponse(
//             "Promotion deleted successfully",
//             200
//         );
//         res.status(response.statusCode).json(response);
//     } catch (error) {
//         throw new NotFoundException("Promotion not found", ErrorCode.PRODUCT_PRODUCT_NOT_FOUND);
//     }
// };

// export const disablePromotion = async (
//     req: Request,
//     res: Response
// ): Promise<void> => {
//     const { id } = req.params;

//     console.log("id", id);

//     try {
//         const promotion = await prisma.promotion.update({
//             where: { id },
//             data: { enabled: false },
//         });

//         const response = new HTTPSuccessResponse(
//             "Promotion disabled successfully",
//             200,
//             promotion
//         );
//         res.status(response.statusCode).json(response);
//     } catch (error) {
//         throw new NotFoundException("Promotion not found", ErrorCode.PRODUCT_PRODUCT_NOT_FOUND);
//     }
// };

import { ZodError } from "zod";
import { Response } from "express";
import prisma from "../connect";

export const handleValidationError = (res: Response, validationResult: { success: boolean; error?: ZodError }) => {
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Invalid data provided",
      details: validationResult.error?.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }
  return null;
};


export const generateCode = async () => {
  // Determine the final code
  let finalCode: string;

  finalCode = "PROMO-" + Math.floor(Math.random() * 1000000);


  // Check for uniqueness and, if needed, generate a new code by appending a random number.
  const existingPromotion = await prisma.promotion.findUnique({
    where: { code: finalCode },
  });
  if (existingPromotion) {
    finalCode = `${finalCode}-${Math.floor(Math.random() * 10000)}`;
  }

  return finalCode;

}
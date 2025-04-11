import { z } from "zod";

// Enum for Promotion Types
export const PromotionType = z.enum(["PERCENTAGE", "FIXED", "WEIGHTED"]);

// Schema for Slabs (used in WEIGHTED promotions)
const SlabSchema = z.object({
  minWeight: z.number().nonnegative(), // Minimum weight
  maxWeight: z.number().nullable(), // Maximum weight, nullable if no upper limit
  discountPerUnit: z.number().positive(), // Discount per unit weight
});

// Main Promotion Schema
export const PromotionSchema = z
  .object({
    title: z.string().min(1, "Title is required"), // Promotion title
    startDate: z.string().refine(
      (date) => !isNaN(new Date(date).getTime()),
      "Invalid start date"
    ), // Valid date string
    endDate: z.string().refine(
      (date) => !isNaN(new Date(date).getTime()),
      "Invalid end date"
    ), // Valid date string
    type: PromotionType, // Promotion type (enum)
    discount: z.number().positive().nullable().optional(), // Discount for PERCENTAGE and FIXED
    code: z.string().optional(), // Optional promotion code
    slabs: z.array(SlabSchema).nullable().optional(), // Slabs for WEIGHTED promotions
    productIds: z.array(z.number()).min(1, "At least one product ID is required"), // Product IDs
    isActive: z.boolean(), // Whether the promotion is active
    description: z.string().optional(), // Optional description
  })
  .superRefine((data, ctx) => {
    const { type, discount, slabs, startDate, endDate } = data;

    // Validate that `discount` is required for PERCENTAGE or FIXED promotions
    if ((type === "PERCENTAGE" || type === "FIXED") && discount === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["discount"],
        message: `Discount is required for ${type} promotions.`,
      });
    }

    // Validate that `slabs` are required for WEIGHTED promotions
    if (type === "WEIGHTED" && (!slabs || slabs.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["slabs"],
        message: "Slabs are required for WEIGHTED promotions.",
      });
    }

    // Validate startDate is before endDate
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (start >= end) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Start date must be before the end date.",
      });
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after the start date.",
      });
    }
  });

// Example usage
export type Promotion = z.infer<typeof PromotionSchema>;

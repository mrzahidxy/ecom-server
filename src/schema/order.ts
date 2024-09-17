import { z } from "zod";

export const orderStatusSchema = z.enum([
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED'
    ])
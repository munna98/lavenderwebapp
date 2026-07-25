import { z } from "zod";

export const LineItemSchema = z.object({
  partNumber: z
    .string()
    .transform((val) => val.replace(/\s+/g, ""))
    .pipe(z.string().min(1, "Part number is required")),
  name: z.string(),
  qty: z.number().min(0.0001, "Quantity must be greater than 0"),
  rate: z.number().min(0, "Rate cannot be negative"),
  taxPercent: z.number(),
});

export const CreateDocumentSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  notes: z.string().optional(),
  items: z.array(LineItemSchema).min(1, "At least one line item is required"),
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type LineItemInput = z.infer<typeof LineItemSchema>;

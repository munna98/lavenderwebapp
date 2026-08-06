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

export const QuotationLineItemSchema = z.object({
  partNumber: z
    .string()
    .transform((val) => val.replace(/\s+/g, "")),
  name: z.string().min(1, "Description is required"),
  qty: z.number().min(0.0001, "Quantity must be greater than 0"),
  rate: z.number().min(0, "Rate cannot be negative"),
  taxPercent: z.number(),
});

export const CreateDocumentSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  supplierEmail: z.string().optional(),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  items: z.array(LineItemSchema).min(1, "At least one line item is required"),
});

export const CreateQuotationSchema = z.object({
  supplierId: z.string().min(1, "Please select a customer"),
  supplierEmail: z.string().optional(),
  notes: z.string().optional(),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  items: z.array(QuotationLineItemSchema).min(1, "At least one line item is required"),
});

export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type CreateQuotationInput = z.infer<typeof CreateQuotationSchema>;
export type LineItemInput = z.infer<typeof LineItemSchema>;

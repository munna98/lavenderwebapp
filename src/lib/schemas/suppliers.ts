import { z } from "zod";

export const SupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  taxId: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof SupplierSchema>;

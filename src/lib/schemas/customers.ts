import { z } from "zod";

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  additionalEmails: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

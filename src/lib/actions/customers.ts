"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CreateCustomerSchema } from "@/lib/schemas/customers";

export type CustomerActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createCustomer(
  formData: FormData
): Promise<CustomerActionResult> {
  await requireAuth();

  const rawData = {
    name: formData.get("name")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() || undefined,
    additionalEmails: formData.get("additionalEmails")?.toString().trim() || undefined,
    phone: formData.get("phone")?.toString().trim() || undefined,
    address: formData.get("address")?.toString().trim() || undefined,
    taxId: formData.get("taxId")?.toString().trim() || undefined,
  };

  const parsed = CreateCustomerSchema.safeParse(rawData);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return { success: false, error: issues[0]?.message ?? "Validation failed" };
  }

  let customerId = "";

  try {
    const customer = await prisma.customer.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        additionalEmails: parsed.data.additionalEmails || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        taxId: parsed.data.taxId || null,
      },
    });
    customerId = customer.id;
  } catch (err: unknown) {
    console.error("createCustomer error:", err);
    return { success: false, error: "Failed to create customer." };
  }

  revalidatePath("/customers");
  redirect(`/customers/${customerId}`);
}

export async function updateCustomer(
  customerId: string,
  formData: FormData
): Promise<CustomerActionResult> {
  await requireAuth();

  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!existing) return { success: false, error: "Customer not found." };

  const rawData = {
    name: formData.get("name")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() || undefined,
    additionalEmails: formData.get("additionalEmails")?.toString().trim() || undefined,
    phone: formData.get("phone")?.toString().trim() || undefined,
    address: formData.get("address")?.toString().trim() || undefined,
    taxId: formData.get("taxId")?.toString().trim() || undefined,
  };

  const parsed = CreateCustomerSchema.safeParse(rawData);
  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return { success: false, error: issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        additionalEmails: parsed.data.additionalEmails || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        taxId: parsed.data.taxId || null,
      },
    });
  } catch (err: unknown) {
    console.error("updateCustomer error:", err);
    return { success: false, error: "Failed to update customer." };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/customers/${customerId}`);
}

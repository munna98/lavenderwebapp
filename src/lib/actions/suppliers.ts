"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SupplierSchema } from "@/lib/schemas/suppliers";

export type ActionResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createSupplier(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = SupplierSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    additionalEmails: formData.get("additionalEmails") || undefined,
    taxId: formData.get("taxId") || undefined,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return { success: false, error: issues[0]?.message ?? "Validation failed" };
  }

  let supplierId = "";

  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: parsed.data.name,
        address: parsed.data.address ?? null,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email || null,
        additionalEmails: parsed.data.additionalEmails || null,
        taxId: parsed.data.taxId ?? null,
      },
    });
    supplierId = supplier.id;
  } catch {
    return { success: false, error: "Failed to create supplier." };
  }

  revalidatePath("/suppliers");
  redirect(`/suppliers/${supplierId}`);
}

export async function updateSupplier(
  supplierId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = SupplierSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    additionalEmails: formData.get("additionalEmails") || undefined,
    taxId: formData.get("taxId") || undefined,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues || [];
    return { success: false, error: issues[0]?.message ?? "Validation failed" };
  }

  try {
    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name: parsed.data.name,
        address: parsed.data.address ?? null,
        phone: parsed.data.phone ?? null,
        email: parsed.data.email || null,
        additionalEmails: parsed.data.additionalEmails || null,
        taxId: parsed.data.taxId ?? null,
      },
    });
  } catch {
    return { success: false, error: "Failed to update supplier." };
  }

  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${supplierId}`);
  redirect(`/suppliers/${supplierId}`);
}

export async function getSuppliers() {
  await requireAuth();
  return prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });
}

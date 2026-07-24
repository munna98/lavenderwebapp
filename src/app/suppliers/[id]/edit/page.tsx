import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSupplier } from "@/lib/actions/suppliers";
import SupplierForm from "../../supplier-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Supplier — Lavender Auto Parts",
};

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  // Bind the supplier ID to the action
  const boundAction = updateSupplier.bind(null, id);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Edit supplier</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {supplier.name}
        </p>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <SupplierForm
          supplier={supplier}
          action={boundAction}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}

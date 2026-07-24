import { requireAdmin } from "@/lib/auth";
import { createSupplier } from "@/lib/actions/suppliers";
import SupplierForm from "../supplier-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Supplier — Lavender Auto Parts",
};

export default async function NewSupplierPage() {
  await requireAdmin();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Add supplier</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Fill in the supplier&apos;s details below.
        </p>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <SupplierForm action={createSupplier} submitLabel="Create supplier" />
      </div>
    </div>
  );
}

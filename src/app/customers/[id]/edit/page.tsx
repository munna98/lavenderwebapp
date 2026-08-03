import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCustomer } from "@/lib/actions/customers";
import CustomerForm from "../../customer-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Customer — Lavender Auto Spare Parts",
};

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  // Bind the customer ID to the action
  const boundAction = updateCustomer.bind(null, id);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Edit customer</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {customer.name}
        </p>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <CustomerForm
          customer={customer}
          action={boundAction}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}

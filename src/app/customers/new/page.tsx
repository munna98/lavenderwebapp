import { requireAuth } from "@/lib/auth";
import { createCustomer } from "@/lib/actions/customers";
import CustomerForm from "../customer-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Customer — Lavender Auto Spare Parts",
};

export default async function NewCustomerPage() {
  await requireAuth();

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Add customer</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Fill in the customer&apos;s details below.
        </p>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <CustomerForm action={createCustomer} submitLabel="Create customer" />
      </div>
    </div>
  );
}

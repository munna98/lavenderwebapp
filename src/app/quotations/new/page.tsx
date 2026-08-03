import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuotationForm from "@/components/quotations/quotation-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Sales Quotation — Lavender Auto Spare Parts",
};

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  await requireAuth();
  const { customerId } = await searchParams;

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">New Sales Quotation</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Create a new quotation for client approval.
        </p>
      </div>

      <QuotationForm
        customers={customers}
        initialData={customerId ? { documentId: "", customerId, items: [] } : undefined}
      />
    </div>
  );
}

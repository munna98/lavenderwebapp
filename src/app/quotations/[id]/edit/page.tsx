import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuotationForm from "@/components/quotations/quotation-form";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Sales Quotation — Lavender Auto Spare Parts",
};

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!doc || doc.type !== "QUOTATION") notFound();
  if (doc.status !== "DRAFT") redirect(`/quotations/${doc.id}`);

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
  });

  const initialData = {
    documentId: doc.id,
    customerId: doc.customerId || "",
    customerEmail: doc.customerEmail,
    notes: doc.notes,
    customerName: doc.customerName,
    items: doc.items.map((i) => ({
      partNumber: i.partNumber,
      name: i.name,
      qty: Number(i.qty),
      rate: Number(i.rate),
      taxPercent: Number(i.taxPercent),
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Edit Sales Quotation {doc.number}</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Update line items or customer details before dispatch.
        </p>
      </div>

      <QuotationForm customers={customers} initialData={initialData} />
    </div>
  );
}

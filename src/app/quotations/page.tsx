import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuotationsClient from "./quotations-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Quotations — Lavender Auto Spare Parts",
};

export default async function QuotationsPage() {
  // Temporary redirect for demo purpose
  redirect("/coming-soon");

  await requireAuth();

  const [documents, customers] = await Promise.all([
    prisma.document.findMany({
      where: { type: "QUOTATION" },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        items: { select: { partNumber: true, qty: true, rate: true } },
      },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const formattedDocs = documents.map((doc) => {
    const subtotal = doc.items.reduce(
      (sum, item) => sum + Number(item.qty) * Number(item.rate),
      0
    );
    const grandTotal = subtotal * 1.05;

    const totalFormatted = `AED ${grandTotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    return {
      id: doc.id,
      number: doc.number,
      status: doc.status,
      createdAt: doc.createdAt,
      customerId: doc.customerId,
      customerName: doc.customerName,
      customer: doc.customer,
      createdBy: doc.createdBy,
      itemsCount: doc.items.length,
      totalFormatted,
      partNumbers: doc.items.map((i) => i.partNumber),
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sales Quotations</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Create and track client price quotes ({formattedDocs.length} total)
          </p>
        </div>

        <Link
          href="/quotations/new"
          id="create-quotation-btn"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Quotation
        </Link>
      </div>

      <QuotationsClient quotations={formattedDocs} customers={customers} />
    </div>
  );
}

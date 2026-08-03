import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTotals } from "@/lib/utils/totals";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import CustomerQuotationsTable from "./customer-quotations-table";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: customer ? `${customer.name} — Lavender Auto Parts` : "Customer Detail",
  };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [auth, customer] = await Promise.all([
    requireAuth(),
    prisma.customer.findUnique({
      where: { id },
      include: {
        documents: {
          where: { type: "QUOTATION" },
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: true,
            items: true,
          },
        },
      },
    }),
  ]);

  if (!customer) notFound();

  const formattedDocuments = customer.documents.map((doc) => {
    const totals = computeTotals(
      doc.items.map((item) => ({
        qty: item.qty.toString(),
        rate: item.rate.toString(),
        taxPercent: item.taxPercent?.toString() || "0",
      }))
    );
    return {
      id: doc.id,
      number: doc.number,
      status: doc.status,
      createdAt: doc.createdAt,
      createdBy: { name: doc.createdBy.name },
      totalFormatted: totals.totalFormatted,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Added on {customer.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {auth.role === "ADMIN" && (
            <Link
              href={`/customers/${customer.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm border font-medium cursor-pointer transition-colors hover:bg-surface-raised"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="sm:hidden">Edit</span>
              <span className="hidden sm:inline">Edit Customer</span>
            </Link>
          )}
          <Link
            href={`/quotations/new?customerId=${customer.id}`}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="sm:hidden">New Quote</span>
            <span className="hidden sm:inline">Create Quotation</span>
          </Link>
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm border font-medium cursor-pointer transition-colors hover:bg-surface-raised"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Customers</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer Details */}
        <div className="space-y-4 md:col-span-1">
          <div
            className="rounded-xl border p-5 space-y-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Customer Info
            </h2>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Email Addresses
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                {customer.email || "—"}
              </p>
              {customer.additionalEmails && (
                <p className="text-xs mt-1 font-mono-nums" style={{ color: "var(--muted-foreground)" }}>
                  Additional: {customer.additionalEmails}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Phone
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                {customer.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Address
              </p>
              <p className="text-sm font-medium mt-0.5 whitespace-pre-line" style={{ color: "var(--foreground)" }}>
                {customer.address || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Tax ID
              </p>
              <p className="text-sm font-mono-nums font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                {customer.taxId || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sales Quotations */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Sales Quotations</h2>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {customer.documents.length} quote{customer.documents.length !== 1 ? "s" : ""}
            </span>
          </div>

          <CustomerQuotationsTable documents={formattedDocuments} />
        </div>
      </div>
    </div>
  );
}

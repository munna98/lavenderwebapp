import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTotals } from "@/lib/utils/totals";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: { name: true },
  });
  return {
    title: supplier ? `${supplier.name} — Lavender Auto Parts` : "Supplier Detail",
  };
}

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [auth, supplier] = await Promise.all([
    requireAuth(),
    prisma.supplier.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: true,
            items: true,
          },
        },
      },
    }),
  ]);

  if (!supplier) notFound();

  const badgeStyles: Record<"DRAFT" | "SENT" | "CANCELLED", { background: string; color: string }> = {
    DRAFT: { background: "var(--status-draft-bg)", color: "var(--status-draft-text)" },
    SENT: { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" },
    CANCELLED: { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{supplier.name}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Added on {supplier.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {auth.role === "ADMIN" && (
            <Link
              href={`/suppliers/${supplier.id}/edit`}
              className="px-4 py-2 rounded-lg text-sm border font-medium cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface)" }}
            >
              Edit supplier
            </Link>
          )}
          <Link
            href="/po/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            + Create PO
          </Link>
          <Link
            href="/suppliers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border font-medium cursor-pointer transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Suppliers</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Supplier Details */}
        <div className="space-y-4 md:col-span-1">
          <div
            className="rounded-xl border p-5 space-y-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Supplier Info
            </h2>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Email
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                {supplier.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Phone
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                {supplier.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Address
              </p>
              <p className="text-sm font-medium mt-0.5 whitespace-pre-line" style={{ color: "var(--foreground)" }}>
                {supplier.address || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Tax ID
              </p>
              <p className="text-sm font-mono-nums font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
                {supplier.taxId || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Purchase Orders */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">Purchase Orders</h2>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {supplier.documents.length} order{supplier.documents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {supplier.documents.length === 0 ? (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
            >
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No purchase orders created for this supplier yet.
              </p>
            </div>
          ) : (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>PO #</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Status</th>
                    <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Created By</th>
                    <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Total</th>
                    <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.documents.map((doc, idx) => {
                    const totals = computeTotals(
                      doc.items.map((item) => ({
                        qty: item.qty.toString(),
                        rate: item.rate.toString(),
                        taxPercent: item.taxPercent?.toString() || "0",
                      }))
                    );

                    return (
                      <tr
                        key={doc.id}
                        style={{
                          borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                          background: "var(--surface)",
                        }}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/po/${doc.id}`}
                            className="font-medium font-mono-nums hover:underline underline-offset-2"
                            style={{ color: "var(--accent)" }}
                          >
                            {doc.number}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                            style={badgeStyles[doc.status]}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                          {doc.createdBy.name}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-nums font-semibold">
                          {totals.totalFormatted}
                        </td>
                        <td className="px-4 py-3 text-right text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {doc.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

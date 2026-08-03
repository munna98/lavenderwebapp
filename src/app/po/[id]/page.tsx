import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTotals } from "@/lib/utils/totals";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PoActions from "./po-actions";
import NewPoPage from "@/app/po/new/page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (id === "new") {
    return { title: "New Purchase Order — Lavender Auto Spare Parts" };
  }
  const doc = await prisma.document.findUnique({ where: { id }, select: { number: true } });
  return {
    title: doc ? `${doc.number} — Purchase Order` : "Purchase Order",
  };
}

export default async function PoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <NewPoPage />;
  }

  // Run auth check and DB query concurrently in parallel to eliminate query waterfalls
  const [auth, doc] = await Promise.all([
    requireAuth(),
    prisma.document.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: true,
        items: true,
      },
    }),
  ]);

  if (!doc) notFound();

  const supplierName = doc.snapshotSupplierName || doc.supplier?.name || "Supplier";
  const supplierAddress = doc.snapshotSupplierAddress || doc.supplier?.address;
  const supplierPhone = doc.snapshotSupplierPhone || doc.supplier?.phone;
  const supplierEmail = doc.supplierEmail || doc.snapshotSupplierEmail || doc.supplier?.email || null;
  const supplierTaxId = doc.snapshotSupplierTaxId || doc.supplier?.taxId;

  const totals = computeTotals(
    doc.items.map((item: { qty: { toString(): string }; rate: { toString(): string }; taxPercent?: { toString(): string } }) => ({
      qty: item.qty.toString(),
      rate: item.rate.toString(),
      taxPercent: item.taxPercent?.toString() || "0",
    }))
  );

  const canCancel =
    auth.role === "ADMIN" ||
    (doc.createdById === auth.user.id && doc.status === "DRAFT");

  const canEdit =
    auth.role === "ADMIN" ||
    (doc.createdById === auth.user.id && doc.status === "DRAFT");

  const badgeStyles: Record<"DRAFT" | "SENT" | "CANCELLED", { background: string; color: string }> = {
    DRAFT: { background: "var(--status-draft-bg)", color: "var(--status-draft-text)" },
    SENT: { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" },
    CANCELLED: { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{doc.number}</h1>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase"
              style={badgeStyles[doc.status]}
            >
              {doc.status}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Created by {doc.createdBy.name} on{" "}
            {doc.createdAt.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {doc.sentAt && (
              <> · Sent on {doc.sentAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</>
            )}
          </p>
        </div>

        <PoActions
          documentId={doc.id}
          status={doc.status}
          supplierEmail={supplierEmail}
          canCancel={canCancel}
          canEdit={canEdit}
        />
      </div>

      {/* Two-Column Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Supplier & Customer Details */}
        <div className="space-y-4 md:col-span-1">
          <div
            className="rounded-xl border p-5 space-y-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Supplier
            </h2>
            <div>
              <p className="font-semibold text-base">{supplierName}</p>
              {supplierAddress && <p className="text-sm mt-1 whitespace-pre-line" style={{ color: "var(--muted-foreground)" }}>{supplierAddress}</p>}
              {supplierPhone && <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>Phone: {supplierPhone}</p>}
              {supplierEmail && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Email: {supplierEmail}</p>}
              {supplierTaxId && <p className="text-xs font-mono-nums mt-1" style={{ color: "var(--muted-foreground)" }}>Tax ID: {supplierTaxId}</p>}
            </div>
          </div>

          {(doc.customerName || doc.customerContact) && (
            <div
              className="rounded-xl border p-5 space-y-2"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Customer Reference
              </h2>
              {doc.customerName && <p className="font-semibold text-sm">{doc.customerName}</p>}
              {doc.customerContact && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Contact: {doc.customerContact}</p>}
            </div>
          )}

          {doc.notes && (
            <div
              className="rounded-xl border p-5 space-y-2"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Notes & Instructions
              </h2>
              <p className="text-sm whitespace-pre-line" style={{ color: "var(--foreground)" }}>{doc.notes}</p>
            </div>
          )}
        </div>

        {/* Items Table & Totals */}
        <div className="md:col-span-2 space-y-6">
          {/* Mobile Line Items Card View (< sm) */}
          <div className="sm:hidden space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Line Items ({doc.items.length})
            </h2>
            {doc.items.map((item, idx) => {
              const qty = Number(item.qty);
              const rate = Number(item.rate);
              const lineGross = qty * rate;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border p-3.5 space-y-2"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  {/* Header: Sl No + Part Number */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono-nums font-medium" style={{ color: "var(--muted-foreground)" }}>
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-sm font-mono-nums truncate" style={{ color: "var(--accent)" }}>
                      {item.partNumber}
                    </span>
                  </div>

                  {/* Description */}
                  {item.name && (
                    <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {item.name}
                    </p>
                  )}

                  {/* Qty, Rate & Total (Enhanced Visibility) */}
                  <div className="flex items-center justify-between pt-2 text-sm font-mono-nums border-t" style={{ borderColor: "var(--border)" }}>
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>
                      {qty} <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>×</span> {rate.toFixed(2)}
                    </span>
                    <span className="font-bold text-base" style={{ color: "var(--accent)" }}>
                      {lineGross.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Line Items Table (≥ sm) */}
          <div
            className="hidden sm:block rounded-xl border overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
                  <th className="text-center px-3 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)", width: "8%" }}>#</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)", width: "27%" }}>Part #</th>
                  <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)", width: "35%" }}>Description</th>
                  <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)", width: "10%" }}>Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)", width: "10%" }}>Rate</th>
                  <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)", width: "10%" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item, idx) => {
                  const qty = Number(item.qty);
                  const rate = Number(item.rate);
                  const lineGross = qty * rate;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                        background: "var(--surface)",
                      }}
                    >
                      <td className="px-3 py-3 text-center text-xs font-mono-nums font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold font-mono-nums">{item.partNumber}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: item.name ? "var(--foreground)" : "var(--muted-foreground-soft)" }}>
                        {item.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-nums">{qty.toString()}</td>
                      <td className="px-4 py-3 text-right font-mono-nums">{rate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono-nums font-semibold">{lineGross.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Box */}
          <div
            className="rounded-xl border p-5 max-w-xs ml-auto space-y-2.5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
              <span className="font-mono-nums">{totals.subtotalFormatted}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>VAT (5%)</span>
              <span className="font-mono-nums">{totals.totalTaxFormatted}</span>
            </div>
            <div className="border-t pt-2.5 flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
              <span className="font-semibold text-base">Total</span>
              <span className="font-mono-nums text-lg font-bold" style={{ color: "var(--accent)" }}>
                {totals.totalFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

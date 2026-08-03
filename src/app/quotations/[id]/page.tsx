import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuotationActions from "./quotation-actions";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  return {
    title: doc
      ? `Sales Quotation ${doc.number} — Lavender Auto Spare Parts`
      : "Quotation Not Found",
  };
}

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireAuth();
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: true,
      items: true,
    },
  });

  if (!doc || doc.type !== "QUOTATION") notFound();

  const customerName = doc.snapshotCustomerName || doc.customer?.name || "Cash Customer";
  const customerAddress = doc.snapshotCustomerAddress || doc.customer?.address;
  const customerPhone = doc.snapshotCustomerPhone || doc.customer?.phone;
  const customerEmail = doc.customerEmail || doc.snapshotCustomerEmail || doc.customer?.email;
  const customerTaxId = doc.snapshotCustomerTaxId || doc.customer?.taxId;

  const dateStr = (doc.sentAt || doc.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const subtotal = doc.items.reduce((acc, item) => acc + Number(item.qty) * Number(item.rate), 0);
  const vatAmount = subtotal * 0.05;
  const grandTotal = subtotal + vatAmount;

  const fmt = (num: number) =>
    num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const badgeStyles = {
    DRAFT: { background: "var(--status-draft-bg)", color: "var(--status-draft-text)" },
    SENT: { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" },
    CANCELLED: { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" },
  }[doc.status];

  const canCancel =
    auth.role === "ADMIN" ||
    (doc.createdById === auth.user.id && doc.status === "DRAFT");
  const canEdit = auth.role === "ADMIN" || doc.createdById === auth.user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold font-mono-nums tracking-tight">
            Quotation {doc.number}
          </h1>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={badgeStyles}
          >
            {doc.status}
          </span>
        </div>

        <QuotationActions
          documentId={doc.id}
          status={doc.status}
          customerEmail={customerEmail ?? null}
          canCancel={canCancel}
          canEdit={canEdit}
        />
      </div>

      {/* Document Details Card */}
      <div
        className="rounded-xl border p-6 space-y-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
          {/* Customer Info */}
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Customer Info
            </span>
            <p className="font-semibold text-base" style={{ color: "var(--foreground)" }}>{customerName}</p>
            {customerAddress && <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{customerAddress}</p>}
            {customerPhone && <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Phone: {customerPhone}</p>}
            {customerEmail && <p className="text-sm font-mono-nums" style={{ color: "var(--muted-foreground)" }}>Email: {customerEmail}</p>}
            {customerTaxId && <p className="text-sm font-mono-nums" style={{ color: "var(--muted-foreground)" }}>TRN: {customerTaxId}</p>}
          </div>

          {/* Quotation Metadata */}
          <div className="space-y-1 sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Quotation Metadata
            </span>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Date: <span className="font-medium" style={{ color: "var(--foreground)" }}>{dateStr}</span>
            </p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Issued By: <span className="font-medium" style={{ color: "var(--foreground)" }}>Lavender Auto Spare Parts</span>
            </p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Prepared By: <span className="font-medium" style={{ color: "var(--foreground)" }}>{doc.createdBy.name}</span>
            </p>
            {doc.createdBy.phone && (
              <p className="text-sm font-mono-nums" style={{ color: "var(--muted-foreground)" }}>
                Mobile: <span className="font-medium" style={{ color: "var(--foreground)" }}>{doc.createdBy.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-raised)" }}>
                <th className="text-left py-2.5 px-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>#</th>
                <th className="text-left py-2.5 px-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Part #</th>
                <th className="text-left py-2.5 px-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Description</th>
                <th className="text-right py-2.5 px-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Qty</th>
                <th className="text-right py-2.5 px-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Rate</th>
                <th className="text-right py-2.5 px-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => {
                const qty = Number(item.qty);
                const rate = Number(item.rate);
                const total = qty * rate;

                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-3 text-xs font-mono-nums" style={{ color: "var(--muted-foreground)" }}>{idx + 1}</td>
                    <td className="py-3 px-3 font-mono-nums font-semibold" style={{ color: "var(--accent)" }}>{item.partNumber}</td>
                    <td className="py-3 px-3 font-medium">{item.name || "—"}</td>
                    <td className="py-3 px-3 text-right font-mono-nums">{qty}</td>
                    <td className="py-3 px-3 text-right font-mono-nums">{fmt(rate)}</td>
                    <td className="py-3 px-3 text-right font-mono-nums font-semibold">{fmt(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Rail */}
        <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Subtotal:</span>
              <span className="font-mono-nums">AED {fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>VAT (5%):</span>
              <span className="font-mono-nums">AED {fmt(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <span>Grand Total:</span>
              <span className="font-mono-nums" style={{ color: "var(--accent)" }}>AED {fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {doc.notes && (
          <div className="pt-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Notes & Terms
            </span>
            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{doc.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

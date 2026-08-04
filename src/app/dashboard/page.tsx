import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home — Lavender Auto Spare Parts",
};

const statusBadge: Record<string, { background: string; color: string }> = {
  DRAFT: { background: "var(--status-draft-bg)", color: "var(--status-draft-text)" },
  SENT: { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" },
  CANCELLED: { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" },
};

const typeBadge: Record<string, { background: string; color: string; label: string }> = {
  PO: { background: "var(--accent-soft)", color: "var(--accent)", label: "PO" },
  QUOTATION: { background: "color-mix(in srgb, var(--accent) 10%, transparent)", color: "var(--accent)", label: "SQ" },
};

export default async function DashboardPage() {
  await requireAuth();

  // Fetch the 10 most recent documents across both types
  const recent = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      type: true,
      number: true,
      status: true,
      createdAt: true,
      customerName: true,
      snapshotSupplierName: true,
      snapshotCustomerName: true,
      supplier: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  const formatted = recent.map((doc) => {
    const party =
      doc.type === "PO"
        ? doc.snapshotSupplierName || doc.supplier?.name || "—"
        : doc.snapshotCustomerName || doc.customer?.name || "Cash Customer";

    return {
      id: doc.id,
      type: doc.type,
      number: doc.number,
      status: doc.status,
      party,
      reference: doc.customerName || "—",
      createdAt: doc.createdAt,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good day 👋</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          What would you like to do today?
        </p>
      </div>

      {/* Quick-Create Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/po/new"
          id="create-po-btn"
          className="rounded-xl border p-5 flex flex-col gap-2 transition-colors hover:bg-surface-raised group"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">New Purchase Order</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Order from a supplier</p>
          </div>
        </Link>

        <Link
          href="/quotations/new"
          id="create-sq-btn"
          className="rounded-xl border p-5 flex flex-col gap-2 transition-colors hover:bg-surface-raised group"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">New Sales Quotation</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Quote a price to a customer</p>
          </div>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          Recent
        </h2>

        {formatted.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No documents yet.</p>
        ) : (
          <div className="space-y-1.5">
            {formatted.map((doc) => {
              const href = doc.type === "PO" ? `/po/${doc.id}` : `/quotations/${doc.id}`;
              const badge = typeBadge[doc.type];
              const statusStyle = statusBadge[doc.status];
              return (
                <Link
                  key={doc.id}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors hover:bg-surface-raised"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {/* Type pill */}
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={badge}
                  >
                    {badge.label}
                  </span>

                  {/* Number + party */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm font-mono-nums" style={{ color: "var(--accent)" }}>
                        {doc.number}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide"
                        style={statusStyle}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {doc.party} · {doc.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Reference */}
                  <span className="shrink-0 text-sm truncate max-w-[150px] text-right" style={{ color: "var(--muted-foreground)" }}>
                    {doc.reference}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeTotals } from "@/lib/utils/totals";
import Link from "next/link";
import type { Metadata } from "next";
import PoListClient from "./po-list-client";

export const metadata: Metadata = {
  title: "Purchase Orders — Lavender Auto Parts",
};

export default async function PoListPage() {
  await requireAuth();

  const pos = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      items: true,
    },
  });

  const suppliers = await prisma.supplier.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const formattedPos = pos.map((doc) => {
    const totals = computeTotals(
      doc.items.map((i: { qty: { toString(): string }; rate: { toString(): string }; taxPercent: { toString(): string } }) => ({
        qty: i.qty.toString(),
        rate: i.rate.toString(),
        taxPercent: i.taxPercent.toString(),
      }))
    );

    return {
      id: doc.id,
      number: doc.number,
      status: doc.status,
      createdAt: doc.createdAt,
      sentAt: doc.sentAt,
      supplier: doc.supplier,
      createdBy: doc.createdBy,
      itemsCount: doc.items.length,
      totalFormatted: totals.totalFormatted,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {pos.length} order{pos.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/po/new"
          id="create-po-btn"
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          + Create PO
        </Link>
      </div>

      {pos.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
        >
          <h2 className="font-semibold mb-1">No purchase orders yet</h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
            Create your first purchase order to send to a supplier.
          </p>
          <Link
            href="/po/new"
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Create first PO →
          </Link>
        </div>
      ) : (
        <PoListClient pos={formattedPos} suppliers={suppliers} />
      )}
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewPoForm from "@/components/po/new-po-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Purchase Order — Lavender Auto Parts",
};

export default async function NewPoPage() {
  await requireAuth();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">New Purchase Order</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Fill in the details below and save as draft to review before sending.
        </p>
      </div>

      {suppliers.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center max-w-md mx-auto"
          style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
        >
          <h2 className="font-semibold mb-1">No suppliers yet</h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
            You need to add at least one supplier before creating a purchase order.
          </p>
          <a
            href="/suppliers/new"
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Add a supplier →
          </a>
        </div>
      ) : (
        <NewPoForm suppliers={suppliers} />
      )}
    </div>
  );
}

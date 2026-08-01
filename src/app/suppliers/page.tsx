import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import SuppliersClient from "./suppliers-client";

export const metadata: Metadata = {
  title: "Suppliers — Lavender Auto Parts",
};

export default async function SuppliersPage() {
  const auth = await requireAuth();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { documents: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {auth.role === "ADMIN" && (
          <Link
            href="/suppliers/new"
            id="add-supplier-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Supplier
          </Link>
        )}
      </div>

      {suppliers.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
            style={{ background: "var(--surface-raised)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 className="font-semibold mb-1">No suppliers yet</h2>
          <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
            Add your first supplier to start creating purchase orders.
          </p>
          {auth.role === "ADMIN" && (
            <Link
              href="/suppliers/new"
              className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Add first supplier →
            </Link>
          )}
        </div>
      ) : (
        <SuppliersClient suppliers={suppliers} isAdmin={auth.role === "ADMIN"} />
      )}
    </div>
  );
}

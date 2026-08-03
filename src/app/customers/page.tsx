import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomersClient from "./customers-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers — Lavender Auto Spare Parts",
};

export default async function CustomersPage() {
  // Temporary redirect for demo purpose
  redirect("/coming-soon");

  const auth = await requireAuth();

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      taxId: true,
      _count: {
        select: { documents: { where: { type: "QUOTATION" } } },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Manage client profiles for Sales Quotations ({customers.length} total)
          </p>
        </div>

        <Link
          href="/customers/new"
          id="add-customer-btn"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Customer
        </Link>
      </div>

      <CustomersClient customers={customers} isAdmin={auth.role === "ADMIN"} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DocumentStatus } from "@prisma/client";

type PoItem = {
  id: string;
  number: string;
  status: DocumentStatus;
  createdAt: Date;
  sentAt: Date | null;
  supplier: { id: string; name: string };
  createdBy: { id: string; name: string };
  itemsCount: number;
  totalFormatted: string;
};

type Props = {
  pos: PoItem[];
  suppliers: { id: string; name: string }[];
};

export default function PoListClient({ pos, suppliers }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [supplierFilter, setSupplierFilter] = useState<string>("ALL");
  const router = useRouter();

  const filtered = pos.filter((item) => {
    const matchesSearch =
      item.number.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      item.createdBy.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesSupplier = supplierFilter === "ALL" || item.supplier.id === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const badgeStyles = {
    DRAFT: { background: "var(--status-draft-bg)", color: "var(--status-draft-text)" },
    SENT: { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" },
    CANCELLED: { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" },
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            id="po-list-search"
            type="search"
            placeholder="Search PO #, supplier, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          />
        </div>

        {/* Filter by Status */}
        <select
          id="po-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Filter by Supplier */}
        <select
          id="po-supplier-filter"
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          <option value="ALL">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* List Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>PO #</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Supplier</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>Created By</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>Date</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Status</th>
              <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No purchase orders found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => router.push(`/po/${item.id}`)}
                  onMouseEnter={() => router.prefetch(`/po/${item.id}`)}
                  className="cursor-pointer transition-colors hover:bg-surface-raised"
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                    background: "var(--surface)",
                  }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/po/${item.id}`}
                      prefetch={true}
                      className="font-semibold hover:underline"
                      style={{ color: "var(--accent)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.supplier.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>
                    {item.createdBy.name}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                      style={badgeStyles[item.status]}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums font-semibold">
                    {item.totalFormatted}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

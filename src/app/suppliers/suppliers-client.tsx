"use client";

import { useState } from "react";
import Link from "next/link";
import type { Supplier } from "@prisma/client";
import Pagination from "@/components/ui/pagination";

type SupplierWithCount = Supplier & { _count: { documents: number } };

type Props = {
  suppliers: SupplierWithCount[];
  isAdmin: boolean;
};

export default function SuppliersClient({ suppliers, isAdmin }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  function handleSearchChange(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.taxId?.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="supplier-search"
          type="search"
          placeholder="Search by name, email, or tax ID…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "var(--surface-raised)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>
                Tax ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>
                POs
              </th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No suppliers match &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              paginated.map((supplier, idx) => (
                <tr
                  key={supplier.id}
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                    background: "var(--surface)",
                  }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="font-medium hover:underline underline-offset-2"
                      style={{ color: "var(--accent)" }}
                    >
                      {supplier.name}
                    </Link>
                    {supplier.phone && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {supplier.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>
                    {supplier.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono-nums text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {supplier.taxId ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono-nums text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {supplier._count.documents}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/suppliers/${supplier.id}/edit`}
                        className="text-xs underline underline-offset-2 cursor-pointer"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

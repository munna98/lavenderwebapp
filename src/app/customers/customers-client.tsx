"use client";

import { useState } from "react";
import Link from "next/link";
import Pagination from "@/components/ui/pagination";

type CustomerItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  _count: {
    documents: number;
  };
};

type Props = {
  customers: CustomerItem[];
  isAdmin: boolean;
};

export default function CustomersClient({ customers, isAdmin }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  function handleSearchChange(val: string) {
    setSearch(val);
    setCurrentPage(1);
  }

  const filtered = customers.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.taxId && c.taxId.toLowerCase().includes(query))
    );
  });

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          id="customer-search"
          type="search"
          placeholder="Search by name, email, phone, or tax ID…"
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

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-2">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center text-sm"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            No customers match &ldquo;{search}&rdquo;
          </div>
        ) : (
          paginated.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="block rounded-xl border px-4 py-3.5 transition-colors hover:bg-surface-raised"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--accent)" }}>{customer.name}</p>
                  {customer.email && (
                    <p className="text-xs mt-0.5 truncate font-mono-nums" style={{ color: "var(--muted-foreground)" }}>{customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{customer.phone}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{customer._count.documents} Quote{customer._count.documents !== 1 ? 's' : ''}</p>
                  {customer.taxId && (
                    <p className="text-xs font-mono-nums mt-0.5" style={{ color: "var(--muted-foreground)" }}>{customer.taxId}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div
        className="hidden sm:block rounded-xl border overflow-hidden"
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
                Tax ID / TRN
              </th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider hidden md:table-cell" style={{ color: "var(--muted-foreground)" }}>
                Quotations
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
                  No customers match &ldquo;{search}&rdquo;
                </td>
              </tr>
            ) : (
              paginated.map((customer, idx) => (
                <tr
                  key={customer.id}
                  style={{
                    borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                    background: "var(--surface)",
                  }}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-medium hover:underline underline-offset-2"
                      style={{ color: "var(--accent)" }}
                    >
                      {customer.name}
                    </Link>
                    {customer.phone && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {customer.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "var(--muted-foreground)" }}>
                    {customer.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono-nums text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {customer.taxId ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono-nums text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {customer._count.documents}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/customers/${customer.id}/edit`}
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

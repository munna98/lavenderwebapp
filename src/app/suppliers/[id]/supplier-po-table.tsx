"use client";

import { useState } from "react";
import Link from "next/link";
import type { DocumentStatus } from "@prisma/client";
import Pagination from "@/components/ui/pagination";

type DocumentItem = {
  id: string;
  number: string;
  status: DocumentStatus;
  createdAt: Date;
  createdBy: { name: string };
  totalFormatted: string;
};

type Props = {
  documents: DocumentItem[];
};

export default function SupplierPoTable({ documents }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const badgeStyles: Record<DocumentStatus, { background: string; color: string }> = {
    DRAFT: { background: "var(--status-draft-bg)", color: "var(--status-draft-text)" },
    SENT: { background: "var(--status-sent-bg)", color: "var(--status-sent-text)" },
    CANCELLED: { background: "var(--status-cancelled-bg)", color: "var(--status-cancelled-text)" },
  };

  const paginated = documents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (documents.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
      >
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          No purchase orders created for this supplier yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>PO #</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Status</th>
              <th className="text-left px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Created By</th>
              <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Total</th>
              <th className="text-right px-4 py-3 font-medium text-xs uppercase" style={{ color: "var(--muted-foreground)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((doc, idx) => (
              <tr
                key={doc.id}
                style={{
                  borderTop: idx > 0 ? "1px solid var(--border)" : undefined,
                  background: "var(--surface)",
                }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/po/${doc.id}`}
                    className="font-medium font-mono-nums hover:underline underline-offset-2"
                    style={{ color: "var(--accent)" }}
                  >
                    {doc.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium uppercase"
                    style={badgeStyles[doc.status]}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted-foreground)" }}>
                  {doc.createdBy.name}
                </td>
                <td className="px-4 py-3 text-right font-mono-nums font-semibold">
                  {doc.totalFormatted}
                </td>
                <td className="px-4 py-3 text-right text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={documents.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}

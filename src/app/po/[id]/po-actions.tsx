"use client";

import { useTransition, useState } from "react";
import { sendDocument, cancelDocument } from "@/lib/actions/documents";
import Link from "next/link";

// ── DEMO TOGGLES ─────────────────────────────────────────────
// Send via Email disabled for demo preview
const DEMO_MODE_SEND = true;

type Props = {
  documentId: string;
  status: "DRAFT" | "SENT" | "CANCELLED";
  supplierEmail: string | null;
  canCancel: boolean;
  canEdit?: boolean;
};

export default function PoActions({ documentId, status, supplierEmail, canCancel, canEdit = true }: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSend() {
    if (DEMO_MODE_SEND) return;
    if (!supplierEmail) {
      setFeedback({ type: "error", message: "Supplier email address is missing." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await sendDocument(documentId);
      if (res.success) {
        setFeedback({ type: "success", message: "Purchase order sent successfully via email!" });
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  }

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this purchase order?")) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await cancelDocument(documentId);
      if (res.success) {
        setFeedback({ type: "success", message: "Purchase order has been cancelled." });
      } else {
        setFeedback({ type: "error", message: res.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className="px-4 py-3 rounded-lg text-sm border flex items-center justify-between"
          style={{
            background: feedback.type === "success" ? "var(--accent-soft)" : "#FEF2F2",
            borderColor: feedback.type === "success" ? "var(--accent)" : "#FCA5A5",
            color: feedback.type === "success" ? "var(--accent)" : "#B91C1C",
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-3 opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status === "DRAFT" && canEdit && (
          <Link
            href={`/po/${documentId}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border hover:bg-surface-raised transition-colors"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit Draft</span>
          </Link>
        )}

        {/* Download PDF button (Fully Enabled) */}
        <a
          href={`/api/po/${documentId}/pdf`}
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border hover:bg-surface-raised transition-colors"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download PDF</span>
        </a>

        {status === "DRAFT" && (
          <button
            id="send-po-btn"
            onClick={handleSend}
            disabled={DEMO_MODE_SEND || isPending || !supplierEmail}
            title={DEMO_MODE_SEND ? "Send Email is disabled for preview demo" : undefined}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border-0"
            style={{
              background: DEMO_MODE_SEND ? "var(--muted-foreground-soft)" : "var(--accent)",
              color: "#fff",
              cursor: DEMO_MODE_SEND ? "not-allowed" : "pointer",
              opacity: DEMO_MODE_SEND ? 0.6 : 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>{isPending ? "Sending..." : "Send via Email"}</span>
          </button>
        )}

        {canCancel && status !== "CANCELLED" && (
          <button
            id="cancel-po-btn"
            onClick={handleCancel}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border disabled:opacity-50 transition-colors"
            style={{ borderColor: "#FCA5A5", color: "#B91C1C", background: "#FEF2F2" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="15" y2="15" />
            </svg>
            <span>{isPending ? "Cancelling..." : "Cancel"}</span>
          </button>
        )}

        <a
          href="/po"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border cursor-pointer hover:bg-surface-raised transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to List</span>
        </a>
      </div>
    </div>
  );
}

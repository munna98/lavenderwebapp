"use client";

import { useTransition, useState } from "react";
import { sendQuotation, cancelQuotation } from "@/lib/actions/quotations";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type Props = {
  documentId: string;
  status: "DRAFT" | "SENT" | "CANCELLED";
  customerEmail: string | null;
  canCancel: boolean;
  canEdit?: boolean;
};

export default function QuotationActions({ documentId, status, customerEmail, canCancel, canEdit = true }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  function handleSendClick() {
    if (!customerEmail) {
      toast.error("Customer email address is missing.");
      return;
    }
    setShowSendDialog(true);
  }

  function handleSendConfirm() {
    startTransition(async () => {
      const res = await sendQuotation(documentId);
      setShowSendDialog(false);
      if (res.success) {
        toast.success("Sales Quotation email sent to customer!");
      } else {
        toast.error(res.error ?? "Failed to send Sales Quotation email.");
      }
    });
  }

  function handleCancelConfirm() {
    startTransition(async () => {
      const res = await cancelQuotation(documentId);
      setShowCancelDialog(false);
      if (res.success) {
        toast.success("Sales Quotation has been cancelled.");
      } else {
        toast.error(res.error ?? "Failed to cancel Sales Quotation.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {status === "DRAFT" && canEdit && (
          <Link
            href={`/quotations/${documentId}/edit`}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border hover:bg-surface-raised transition-colors"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span className="sm:hidden">Edit</span>
            <span className="hidden sm:inline">Edit Draft</span>
          </Link>
        )}

        {/* Download PDF button */}
        <a
          href={`/api/quotations/${documentId}/pdf`}
          download
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border hover:bg-surface-raised transition-colors"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="sm:hidden">PDF</span>
          <span className="hidden sm:inline">Download PDF</span>
        </a>

        {/* Send via Email button */}
        {status === "DRAFT" && (
          <button
            id="send-quotation-btn"
            onClick={handleSendClick}
            disabled={isPending || !customerEmail}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors border-0 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span className="sm:hidden">{isPending ? "Sending…" : "Send"}</span>
            <span className="hidden sm:inline">{isPending ? "Sending…" : "Send via Email"}</span>
          </button>
        )}

        {/* Cancel Button */}
        {canCancel && status !== "CANCELLED" && (
          <button
            id="cancel-quotation-btn"
            onClick={() => setShowCancelDialog(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border disabled:opacity-50 transition-colors"
            style={{ borderColor: "#FCA5A5", color: "#B91C1C", background: "#FEF2F2" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            <span>Cancel</span>
          </button>
        )}

        <a
          href="/quotations"
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm border cursor-pointer hover:bg-surface-raised transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to List</span>
        </a>
      </div>

      {/* Confirmation Modal Dialog for Send Email */}
      <ConfirmDialog
        isOpen={showSendDialog}
        title="Send Sales Quotation Email"
        description={
          <>
            Are you sure you want to send this sales quotation email to{" "}
            <strong style={{ color: "var(--accent)" }}>
              {customerEmail || "the customer"}
            </strong>
            ? The PDF document will be attached.
          </>
        }
        confirmLabel="Yes, Send Email"
        cancelLabel="Cancel"
        variant="default"
        isPending={isPending}
        onConfirm={handleSendConfirm}
        onClose={() => setShowSendDialog(false)}
      />

      {/* Confirmation Modal Dialog for Cancel Quotation */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Cancel Sales Quotation"
        description="Are you sure you want to cancel this sales quotation? This action will mark the status as Cancelled in your records."
        confirmLabel="Yes, Cancel Quotation"
        cancelLabel="Keep Quotation"
        variant="danger"
        isPending={isPending}
        onConfirm={handleCancelConfirm}
        onClose={() => setShowCancelDialog(false)}
      />
    </div>
  );
}

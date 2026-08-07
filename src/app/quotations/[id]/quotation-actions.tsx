"use client";

import { useTransition, useState } from "react";
import { markQuotationSent, cancelQuotation } from "@/lib/actions/quotations";
import Link from "next/link";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type Props = {
  documentId: string;
  docNumber: string;
  status: "DRAFT" | "SENT" | "CANCELLED";
  customerName: string;
  customerPhone: string | null;
  totalFormatted: string;
  canCancel: boolean;
  canEdit?: boolean;
};

function sanitizePhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  // Convert local UAE number format 05xxxxxxxx -> 9715xxxxxxxx
  if (cleaned.startsWith("05") && cleaned.length === 10) {
    cleaned = "971" + cleaned.substring(1);
  }
  return cleaned;
}

export default function QuotationActions({
  documentId,
  docNumber,
  status,
  customerName,
  customerPhone,
  totalFormatted,
  canCancel,
  canEdit = true,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [hidePartNumber, setHidePartNumber] = useState(true);

  function handleWhatsAppClick() {
    setShowWhatsAppDialog(true);
  }

  function handleWhatsAppConfirm() {
    const rawPhone = customerPhone || "";
    const cleanPhone = sanitizePhone(rawPhone);

    startTransition(async () => {
      // 1. Mark document as SENT in DB and capture snapshot
      const res = await markQuotationSent(documentId, rawPhone);
      setShowWhatsAppDialog(false);

      if (res.success) {
        toast.success("Quotation marked as Sent!");

        // 2. Trigger PDF download in background
        const pdfUrl = `/api/quotations/${documentId}/pdf?hidePartNumber=${hidePartNumber}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = pdfUrl;
        downloadLink.download = `${docNumber}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // 3. Construct WhatsApp Message text
        const messageText = `Hello ${customerName},\n\nPlease find Sales Quotation ${docNumber} from Lavender Auto Spare Parts.\n\nTotal: ${totalFormatted}\n\nKind regards,\nLavender Auto Spare Parts`;

        // 4. Launch WhatsApp Web / Mobile App in a new tab
        const waUrl = cleanPhone
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

        setTimeout(() => {
          window.open(waUrl, "_blank");
        }, 300);
      } else {
        toast.error(res.error ?? "Failed to update Sales Quotation status.");
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
        {/* Hide Part # Toggle Switch */}
        <button
          type="button"
          onClick={() => setHidePartNumber(!hidePartNumber)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border select-none transition-all"
          style={{
            borderColor: hidePartNumber ? "var(--accent)" : "var(--border)",
            background: hidePartNumber ? "var(--accent-soft)" : "var(--surface)",
            color: hidePartNumber ? "var(--accent)" : "var(--muted-foreground)",
          }}
          title={hidePartNumber ? "Part # is hidden in PDF" : "Part # is shown in PDF"}
        >
          <span
            className="w-7 h-4 rounded-full p-0.5 transition-colors relative flex items-center shrink-0"
            style={{ background: hidePartNumber ? "var(--accent)" : "var(--border-strong)" }}
          >
            <span
              className="w-3 h-3 rounded-full bg-white transition-transform duration-200 shadow-xs"
              style={{ transform: hidePartNumber ? "translateX(12px)" : "translateX(0px)" }}
            />
          </span>
          <span>Hide Part #</span>
        </button>

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
          href={`/api/quotations/${documentId}/pdf?hidePartNumber=${hidePartNumber}`}
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

        {/* Send via WhatsApp button */}
        {status === "DRAFT" && (
          <button
            id="send-whatsapp-btn"
            onClick={handleWhatsAppClick}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors border-0 disabled:opacity-50 shadow-xs"
            style={{
              background: "#25D366",
              color: "#fff",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.2.321-1.157 4.225 4.321-1.133.379.254z" />
            </svg>
            <span className="sm:hidden">{isPending ? "Launching…" : "WhatsApp"}</span>
            <span className="hidden sm:inline">{isPending ? "Launching…" : "Send via WhatsApp"}</span>
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

      {/* Confirmation Modal Dialog for Send WhatsApp */}
      <ConfirmDialog
        isOpen={showWhatsAppDialog}
        title="Send Quotation via WhatsApp"
        description={
          <>
            Are you sure you want to send this quotation via WhatsApp to{" "}
            <strong style={{ color: "var(--accent)" }}>
              {customerName}
            </strong>
            {customerPhone ? ` (${customerPhone})` : ""}? Clicking confirm will download{" "}
            <strong>{docNumber}.pdf</strong>, mark status as <strong>Sent</strong>, and open WhatsApp.
          </>
        }
        confirmLabel="Launch WhatsApp"
        cancelLabel="Cancel"
        variant="default"
        isPending={isPending}
        onConfirm={handleWhatsAppConfirm}
        onClose={() => setShowWhatsAppDialog(false)}
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

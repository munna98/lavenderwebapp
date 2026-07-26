"use client";

import type { UseFormRegister } from "react-hook-form";
import type { CreateDocumentInput } from "@/lib/schemas/documents";

type Totals = {
  subtotal: number;
  totalTax: number;
  total: number;
};

type Props = {
  totals: Totals;
  isPending: boolean;
  isEditing?: boolean;
  register: UseFormRegister<CreateDocumentInput>;
};

function fmt(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SummaryRail({ totals, isPending, isEditing, register }: Props) {
  return (
    <div
      className="sticky top-20 w-full lg:w-72 shrink-0 rounded-xl border p-5 space-y-4"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h2 className="text-sm font-semibold tracking-tight">Summary</h2>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
          <span className="font-mono-nums">{fmt(totals.subtotal)}</span>
        </div>

        <div
          className="border-t pt-2.5"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Total</span>
            <span
              className="font-mono-nums text-lg font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {fmt(totals.total)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        id="save-draft-btn"
        disabled={isPending}
        className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 transition-colors"
        style={{ background: "var(--accent)", color: "#fff" }}
        onMouseEnter={(e) => {
          if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
        }}
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Saving…
          </span>
        ) : isEditing ? (
          "Save Changes"
        ) : (
          "Save as Draft"
        )}
      </button>

      {/* Customer Info Section placed under Summary */}
      <div className="border-t pt-4 space-y-2.5" style={{ borderColor: "var(--border)" }}>
        <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
          Customer Info
        </label>
        <div className="space-y-2">
          <input
            {...register("customerName")}
            placeholder="Customer Name"
            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none focus:border-accent"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          />
          <input
            {...register("customerContact")}
            placeholder="Phone / Contact Info"
            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none focus:border-accent"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
          />
        </div>
      </div>
    </div>
  );
}

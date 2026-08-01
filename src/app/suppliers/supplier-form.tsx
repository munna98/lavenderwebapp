"use client";

import { useTransition, useState } from "react";
import type { Supplier } from "@prisma/client";

type Props = {
  supplier?: Supplier;
  action: (formData: FormData) => Promise<{ success: false; error: string } | { success: true; id: string }>;
  submitLabel?: string;
};

export default function SupplierForm({ supplier, action, submitLabel = "Save supplier" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Parse initial email list from supplier.email & supplier.additionalEmails
  const initialEmails = (() => {
    const list: string[] = [];
    if (supplier?.email?.trim()) list.push(supplier.email.trim());
    if (supplier?.additionalEmails?.trim()) {
      const parts = supplier.additionalEmails.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean);
      list.push(...parts);
    }
    return list.length > 0 ? list : [""];
  })();

  const [emails, setEmails] = useState<string[]>(initialEmails);

  function handleEmailChange(index: number, value: string) {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  }

  function addEmailRow() {
    setEmails([...emails, ""]);
  }

  function removeEmailRow(index: number) {
    if (emails.length === 1) {
      setEmails([""]);
    } else {
      setEmails(emails.filter((_, i) => i !== index));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Filter out empty entries
    const validEmails = emails.map((e) => e.trim()).filter(Boolean);
    formData.set("email", validEmails[0] || "");
    formData.set("additionalEmails", validEmails.slice(1).join(", "));

    startTransition(async () => {
      const result = await action(formData);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm border"
          style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}
        >
          {error}
        </div>
      )}

      {/* Supplier Name */}
      <div>
        <label htmlFor="supplier-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Supplier name <span className="ml-1" style={{ color: "var(--brass)" }}>*</span>
        </label>
        <input
          id="supplier-name"
          name="name"
          type="text"
          required
          placeholder="e.g. Premium Parts Co."
          defaultValue={supplier?.name}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Dynamic Multi-Email List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Email Addresses
          </label>
          <button
            type="button"
            onClick={addEmailRow}
            className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer transition-colors hover:underline"
            style={{ color: "var(--accent)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add another email
          </button>
        </div>

        <div className="space-y-2">
          {emails.map((emailVal, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="email"
                value={emailVal}
                onChange={(e) => handleEmailChange(idx, e.target.value)}
                placeholder={idx === 0 ? "Primary Email (e.g. accounts@supplier.com)" : `Additional Email #${idx + 1}`}
                disabled={isPending}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all focus:border-accent"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                  color: "var(--foreground)",
                }}
              />
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmailRow(idx)}
                  className="w-8.5 h-8.5 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-surface-raised transition-colors shrink-0 text-xs"
                  style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  title="Remove email"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="supplier-phone" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Phone
        </label>
        <input
          id="supplier-phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          defaultValue={supplier?.phone || ""}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="supplier-address" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Address
        </label>
        <textarea
          id="supplier-address"
          name="address"
          placeholder="Street, City, State, ZIP"
          defaultValue={supplier?.address || ""}
          rows={3}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Tax ID */}
      <div>
        <label htmlFor="supplier-taxId" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Tax ID
        </label>
        <input
          id="supplier-taxId"
          name="taxId"
          type="text"
          placeholder="e.g. 12-3456789"
          defaultValue={supplier?.taxId || ""}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          id="supplier-form-submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/suppliers"
          className="px-5 py-2.5 rounded-lg text-sm border cursor-pointer inline-block text-center"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

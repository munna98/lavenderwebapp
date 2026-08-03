"use client";

import { useTransition, useState } from "react";
import type { Customer } from "@prisma/client";
import { toast } from "sonner";

type Props = {
  customer?: Customer;
  action: (formData: FormData) => Promise<{ success: false; error: string } | { success: true; id: string }>;
  submitLabel?: string;
};

export default function CustomerForm({ customer, action, submitLabel = "Save customer" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Parse initial email list from customer.email & customer.additionalEmails
  const initialEmails = (() => {
    const list: string[] = [];
    if (customer?.email?.trim()) list.push(customer.email.trim());
    if (customer?.additionalEmails?.trim()) {
      const parts = customer.additionalEmails.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean);
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
      if (result.success) {
        toast.success("Customer saved successfully!");
      } else {
        setError(result.error);
        toast.error(result.error ?? "Failed to save customer.");
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

      {/* Customer Name */}
      <div>
        <label htmlFor="customer-name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Customer name <span className="ml-1" style={{ color: "var(--brass)" }}>*</span>
        </label>
        <input
          id="customer-name"
          name="name"
          type="text"
          required
          placeholder="e.g. Al Futtaim Motors"
          defaultValue={customer?.name}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent"
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
                placeholder={idx === 0 ? "Primary Email (e.g. info@customer.com)" : `Additional Email #${idx + 1}`}
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
        <label htmlFor="customer-phone" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Phone
        </label>
        <input
          id="customer-phone"
          name="phone"
          type="tel"
          placeholder="+971 50 000 0000"
          defaultValue={customer?.phone || ""}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="customer-address" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Address
        </label>
        <textarea
          id="customer-address"
          name="address"
          placeholder="Street, City, Emirate, Country"
          defaultValue={customer?.address || ""}
          rows={3}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all focus:border-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      {/* Tax ID */}
      <div>
        <label htmlFor="customer-taxId" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
          Tax ID / TRN
        </label>
        <input
          id="customer-taxId"
          name="taxId"
          type="text"
          placeholder="e.g. 100234567800003"
          defaultValue={customer?.taxId || ""}
          disabled={isPending}
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent font-mono-nums"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          id="customer-form-submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <a
          href="/customers"
          className="px-5 py-2.5 rounded-lg text-sm border cursor-pointer inline-block text-center hover:bg-surface-raised transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

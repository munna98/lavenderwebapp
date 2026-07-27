"use client";

import { useTransition, useState } from "react";
import type { Supplier } from "@prisma/client";

type Props = {
  supplier?: Supplier;
  action: (formData: FormData) => Promise<{ success: false; error: string } | { success: true; id: string }>;
  submitLabel?: string;
};

const fields = [
  { name: "name", label: "Supplier name", type: "text", required: true, placeholder: "e.g. Premium Parts Co." },
  { name: "address", label: "Address", type: "textarea", required: false, placeholder: "Street, City, State, ZIP" },
  { name: "phone", label: "Phone", type: "tel", required: false, placeholder: "+1 (555) 000-0000" },
  { name: "email", label: "Email", type: "email", required: false, placeholder: "accounts@supplier.com" },
  { name: "taxId", label: "Tax ID", type: "text", required: false, placeholder: "e.g. 12-3456789" },
] as const;

export default function SupplierForm({ supplier, action, submitLabel = "Save supplier" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.success) {
        setError(result.error);
      }
      // On success the server action calls redirect(), so nothing to do here
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

      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={`supplier-${field.name}`}
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--foreground)" }}
          >
            {field.label}
            {field.required && (
              <span className="ml-1" style={{ color: "var(--brass)" }}>*</span>
            )}
          </label>

          {field.type === "textarea" ? (
            <textarea
              id={`supplier-${field.name}`}
              name={field.name}
              required={field.required}
              placeholder={field.placeholder}
              defaultValue={supplier?.[field.name as keyof Supplier] as string | undefined}
              rows={3}
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--foreground)",
              }}
            />
          ) : (
            <input
              id={`supplier-${field.name}`}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              defaultValue={supplier?.[field.name as keyof Supplier] as string | undefined}
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--foreground)",
              }}
            />
          )}
        </div>
      ))}

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

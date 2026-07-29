"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useRef, useState } from "react";
import { createDocument, updateDocument, type ActionResult } from "@/lib/actions/documents";
import { CreateDocumentSchema, type CreateDocumentInput } from "@/lib/schemas/documents";
import type { Supplier } from "@prisma/client";
import SummaryRail from "./summary-rail";
import SupplierCombobox from "./supplier-combobox";

type Props = {
  suppliers: Supplier[];
  initialData?: {
    documentId: string;
    supplierId: string;
    supplierEmail?: string | null;
    notes?: string | null;
    customerName?: string | null;
    customerContact?: string | null;
    items: Array<{ partNumber: string; name?: string | null; qty: number; rate: number; taxPercent?: number }>;
  };
};

const DEFAULT_ITEM = { partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 };

const DEFAULT_NOTES = `Kindly notify us in advance if any part is unavailable or if there are any price changes or discrepancies before supplying the order.

Please notify us immediately of any stock unavailability, price changes, or discrepancies before processing and dispatching this order.`;

export default function NewPoForm({ suppliers, initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = Boolean(initialData?.documentId);

  const rowInputRefs = useRef<
    Record<number, { partNumber?: HTMLInputElement; name?: HTMLInputElement; qty?: HTMLInputElement; rate?: HTMLInputElement }>
  >({});

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(CreateDocumentSchema),
    defaultValues: {
      supplierId: initialData?.supplierId || "",
      supplierEmail: initialData?.supplierEmail || "",
      notes: initialData?.notes !== undefined && initialData?.notes !== null ? initialData.notes : DEFAULT_NOTES,
      customerName: initialData?.customerName || "",
      customerContact: initialData?.customerContact || "",
      items: initialData?.items && initialData.items.length > 0
        ? initialData.items.map((i) => ({
            partNumber: (i.partNumber || "").replace(/\s+/g, ""),
            name: i.name || "",
            qty: Number(i.qty) || 1,
            rate: Number(i.rate) || 0,
            taxPercent: Number(i.taxPercent) || 0,
          }))
        : [DEFAULT_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const items = form.watch("items");

  const totals = computeDisplayTotals(items);

  function setInputRef(index: number, field: "partNumber" | "name" | "qty" | "rate", el: HTMLInputElement | null) {
    if (!rowInputRefs.current[index]) {
      rowInputRefs.current[index] = {};
    }
    if (el) {
      rowInputRefs.current[index][field] = el;
    }
  }

  function focusInput(index: number, field: "partNumber" | "name" | "qty" | "rate") {
    const el = rowInputRefs.current[index]?.[field];
    if (el) {
      el.focus();
      if (field === "qty" || field === "rate") {
        el.select();
      }
    }
  }

  function addRow() {
    append({ partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 });
    const nextIdx = fields.length;
    setTimeout(() => focusInput(nextIdx, "partNumber"), 50);
  }

  function handlePartNumberKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      focusInput(idx, "name");
    }
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      focusInput(idx, "qty");
    }
  }

  function handleQtyKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      focusInput(idx, "rate");
    }
  }

  function handleRateKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentPartNo = form.getValues(`items.${idx}.partNumber`);

      if (currentPartNo && currentPartNo.trim().length > 0) {
        append({ partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 });
        setTimeout(() => focusInput(idx + 1, "partNumber"), 50);
      } else {
        if (fields.length > 1) {
          remove(idx);
        }
        setTimeout(() => {
          form.handleSubmit(handleSubmit)();
        }, 50);
      }
    }
  }

  function handleSubmit(data: CreateDocumentInput) {
    setServerError(null);
    startTransition(async () => {
      let result: ActionResult;
      if (isEditing && initialData?.documentId) {
        result = await updateDocument(initialData.documentId, data);
      } else {
        result = await createDocument(data);
      }

      if (!result.success) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── Left pane ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* Error banner */}
          {serverError && (
            <div
              className="px-4 py-3 rounded-lg text-sm border"
              style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}
            >
              {serverError}
            </div>
          )}

          {/* Supplier & Optional Supplier Email Override */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Supplier <span style={{ color: "var(--brass)" }}>*</span>
              </label>
              <Controller
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <SupplierCombobox
                    suppliers={suppliers}
                    value={field.value}
                    onChange={(selectedId) => {
                      field.onChange(selectedId);
                      const selectedSup = suppliers.find((s) => s.id === selectedId);
                      if (selectedSup?.email) {
                        form.setValue("supplierEmail", selectedSup.email);
                      }
                    }}
                    onEnterNext={() => focusInput(0, "partNumber")}
                  />
                )}
              />
              {form.formState.errors.supplierId && (
                <p className="mt-1 text-xs font-medium" style={{ color: "#EF4444" }}>
                  {form.formState.errors.supplierId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Supplier Email <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>(for this PO)</span>
              </label>
              <input
                {...form.register("supplierEmail")}
                type="email"
                placeholder="Order recipient email address"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-accent"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Line items <span style={{ color: "var(--brass)" }}>*</span>
              </label>
              <button
                type="button"
                onClick={addRow}
                className="text-xs font-medium cursor-pointer transition-colors hover:underline"
                style={{ color: "var(--accent)" }}
              >
                + Add row
              </button>
            </div>

            {/* Table */}
            <div
              className="rounded-xl border overflow-x-auto"
              style={{ borderColor: "var(--border)" }}
            >
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr style={{ background: "var(--surface-raised)", borderBottom: "1px solid var(--border)" }}>
                    <th className="text-center px-2 py-2.5 text-xs font-medium" style={{ color: "var(--muted-foreground)", width: "6%" }}>#</th>
                    <th className="text-left px-3 py-2.5 text-xs font-medium" style={{ color: "var(--muted-foreground)", width: "24%" }}>Part # <span style={{ color: "var(--brass)" }}>*</span></th>
                    <th className="text-left px-3 py-2.5 text-xs font-medium" style={{ color: "var(--muted-foreground)", width: "32%" }}>Description</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium" style={{ color: "var(--muted-foreground)", width: "11%" }}>Qty</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium" style={{ color: "var(--muted-foreground)", width: "13%" }}>Rate</th>
                    <th className="text-right px-3 py-2.5 text-xs font-medium" style={{ color: "var(--muted-foreground)", width: "10%" }}>Total</th>
                    <th className="px-2 py-2.5" style={{ width: "4%" }} />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, idx) => {
                    const item = items[idx] ?? DEFAULT_ITEM;
                    const lineGross = (Number(item.qty) || 0) * (Number(item.rate) || 0);

                    const { ref: partNoRegRef, onChange: partNoRegOnChange, ...partNoProps } = form.register(`items.${idx}.partNumber`);
                    const { ref: nameRegRef, ...nameProps } = form.register(`items.${idx}.name`);
                    const { ref: qtyRegRef, ...qtyProps } = form.register(`items.${idx}.qty`, { valueAsNumber: true });
                    const { ref: rateRegRef, ...rateProps } = form.register(`items.${idx}.rate`, { valueAsNumber: true });

                    return (
                      <tr
                        key={field.id}
                        style={{ borderTop: idx > 0 ? "1px solid var(--border)" : undefined }}
                      >
                        {/* Sl No. */}
                        <td className="px-2 py-2 text-center text-xs font-mono-nums font-semibold" style={{ color: "var(--muted-foreground)" }}>
                          {idx + 1}
                        </td>

                        {/* Part # */}
                        <td className="px-3 py-2">
                          <input
                            {...partNoProps}
                            onChange={(e) => {
                              e.target.value = e.target.value.replace(/\s+/g, "");
                              partNoRegOnChange(e);
                            }}
                            ref={(e) => {
                              partNoRegRef(e);
                              setInputRef(idx, "partNumber", e);
                            }}
                            onKeyDown={(e) => handlePartNumberKeyDown(e, idx)}
                            placeholder="Part number"
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm font-mono-nums outline-none transition-all focus:border-accent"
                            style={{
                              borderColor: form.formState.errors.items?.[idx]?.partNumber ? "#EF4444" : "var(--border)",
                              background: "var(--surface)",
                              color: "var(--foreground)",
                            }}
                          />
                          {form.formState.errors.items?.[idx]?.partNumber && (
                            <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#EF4444" }}>
                              {form.formState.errors.items[idx]?.partNumber?.message}
                            </p>
                          )}
                        </td>

                        {/* Description */}
                        <td className="px-3 py-2">
                          <input
                            {...nameProps}
                            ref={(e) => {
                              nameRegRef(e);
                              setInputRef(idx, "name", e);
                            }}
                            onKeyDown={(e) => handleNameKeyDown(e, idx)}
                            placeholder="Description"
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none transition-all focus:border-accent"
                            style={{
                              borderColor: "var(--border)",
                              background: "var(--surface)",
                              color: "var(--foreground)",
                            }}
                          />
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-2">
                          <input
                            {...qtyProps}
                            ref={(e) => {
                              qtyRegRef(e);
                              setInputRef(idx, "qty", e);
                            }}
                            type="number"
                            step="any"
                            min="0.0001"
                            onKeyDown={(e) => handleQtyKeyDown(e, idx)}
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm text-right outline-none font-mono-nums focus:border-accent"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                          />
                        </td>

                        {/* Rate */}
                        <td className="px-3 py-2">
                          <input
                            {...rateProps}
                            ref={(e) => {
                              rateRegRef(e);
                              setInputRef(idx, "rate", e);
                            }}
                            type="number"
                            step="any"
                            min="0"
                            onKeyDown={(e) => handleRateKeyDown(e, idx)}
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm text-right outline-none font-mono-nums focus:border-accent"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                          />
                        </td>

                        {/* Line total */}
                        <td className="px-3 py-2 text-right font-mono-nums text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {formatAmount(lineGross)}
                        </td>

                        {/* Remove */}
                        <td className="px-2.5 py-2 text-center">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-raised"
                              style={{ color: "var(--muted-foreground)" }}
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="po-notes" className="block text-sm font-medium mb-1.5">
              Notes <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>(optional)</span>
            </label>
            <textarea
              id="po-notes"
              {...form.register("notes")}
              placeholder="Payment terms, delivery instructions, etc."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        {/* ── Summary Rail ──────────────────────────────── */}
        <SummaryRail
          totals={totals}
          isPending={isPending}
          isEditing={isEditing}
          register={form.register}
        />
      </div>
    </form>
  );
}

function computeDisplayTotals(items: CreateDocumentInput["items"]) {
  let subtotal = 0;
  for (const item of items) {
    const lineSubtotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
    subtotal += lineSubtotal;
  }
  const totalTax = subtotal * 0.05;
  const total = subtotal + totalTax;
  return { subtotal, totalTax, total };
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

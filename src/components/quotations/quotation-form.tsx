"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useRef, useState } from "react";
import { createQuotation, updateQuotation, type ActionResult } from "@/lib/actions/quotations";
import { CreateDocumentSchema, type CreateDocumentInput } from "@/lib/schemas/documents";
import type { Customer } from "@prisma/client";
import SummaryRail from "@/components/po/summary-rail";
import CustomerCombobox from "./customer-combobox";
import ItemDrawer, { type DrawerItem } from "@/components/ui/item-drawer";
import { toast } from "sonner";
import { computeTotals } from "@/lib/utils/totals";

type Props = {
  customers: Customer[];
  initialData?: {
    documentId: string;
    customerId: string;
    customerEmail?: string | null;
    notes?: string | null;
    customerName?: string | null;
    items: Array<{
      partNumber: string;
      name?: string | null;
      qty: number | string;
      rate: number | string;
      taxPercent?: number | string;
    }>;
  };
};

export default function QuotationForm({ customers, initialData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeDrawerIndex, setActiveDrawerIndex] = useState<number | null>(null);
  const isEditing = Boolean(initialData?.documentId);

  // Default to Cash Customer if available and no initialData provided
  const defaultCustomerId = initialData?.customerId || customers.find((c) => c.name.toLowerCase().includes("cash"))?.id || customers[0]?.id || "";

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(CreateDocumentSchema),
    defaultValues: {
      supplierId: defaultCustomerId,
      supplierEmail: initialData?.customerEmail || customers.find((c) => c.id === defaultCustomerId)?.email || "",
      notes: initialData?.notes || "",
      customerName: initialData?.customerName || "",
      items: initialData?.items?.length
        ? initialData.items.map((i) => ({
            partNumber: i.partNumber,
            name: i.name || "",
            qty: Number(i.qty),
            rate: Number(i.rate),
            taxPercent: Number(i.taxPercent || 0),
          }))
        : [{ partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedCustomerId = form.watch("supplierId");

  const isFirstItemUntouched =
    fields.length === 1 &&
    !watchedItems[0]?.partNumber &&
    !watchedItems[0]?.name &&
    (!watchedItems[0]?.rate || Number(watchedItems[0]?.rate) === 0);

  function openDrawerForNew() {
    if (isFirstItemUntouched) {
      setActiveDrawerIndex(0);
    } else {
      append({ partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 });
      setActiveDrawerIndex(fields.length);
    }
  }

  const rowInputRefs = useRef<Array<Record<string, HTMLInputElement>>>([]) as React.MutableRefObject<
    Array<Record<string, HTMLInputElement>>
  >;

  function setInputRef(index: number, field: "partNumber" | "name" | "qty" | "rate", el: HTMLInputElement | null) {
    if (!rowInputRefs.current[index]) rowInputRefs.current[index] = {};
    if (el) rowInputRefs.current[index][field] = el;
  }

  function focusInput(index: number, field: "partNumber" | "name" | "qty" | "rate") {
    const el = rowInputRefs.current[index]?.[field];
    if (el) {
      el.focus();
      if (field === "qty" || field === "rate") el.select();
    }
  }

  function addRow() {
    append({ partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 });
    const nextIdx = fields.length;
    setTimeout(() => focusInput(nextIdx, "partNumber"), 50);
  }

  function handlePartNumberKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") { e.preventDefault(); focusInput(idx, "name"); }
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") { e.preventDefault(); focusInput(idx, "qty"); }
  }

  function handleQtyKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") { e.preventDefault(); focusInput(idx, "rate"); }
  }

  function handleRateKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentPartNo = form.getValues(`items.${idx}.partNumber`);
      if (currentPartNo && currentPartNo.trim().length > 0) {
        append({ partNumber: "", name: "", qty: 1, rate: 0, taxPercent: 0 });
        setTimeout(() => focusInput(idx + 1, "partNumber"), 50);
      } else {
        if (fields.length > 1) remove(idx);
        setTimeout(() => form.handleSubmit(handleSubmit)(), 50);
      }
    }
  }

  function handleSubmit(data: CreateDocumentInput) {
    setServerError(null);
    startTransition(async () => {
      let result: ActionResult;
      if (isEditing && initialData?.documentId) {
        result = await updateQuotation(initialData.documentId, data);
        if (result.success) {
          toast.success("Sales Quotation updated successfully!");
        }
      } else {
        result = await createQuotation(data);
        if (result.success) {
          toast.success("Sales Quotation created successfully!");
        }
      }
      if (!result.success) setServerError(result.error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Left Pane (Fields + Items Table) */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {serverError && (
            <div
              className="p-4 rounded-xl border text-sm"
              style={{ background: "#FEF2F2", borderColor: "#FCA5A5", color: "#B91C1C" }}
            >
              {serverError}
            </div>
          )}

          {/* Customer Selection Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="supplierId"
              render={({ field, fieldState }) => (
                <CustomerCombobox
                  customers={customers}
                  selectedCustomerId={field.value}
                  onSelect={(id, email) => {
                    field.onChange(id);
                    if (email) form.setValue("supplierEmail", email);
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />

            <div>
              <label
                htmlFor="customerEmail"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Email Address for Quotation
              </label>
              <input
                id="customerEmail"
                type="email"
                placeholder="Leave empty to use customer default"
                {...form.register("supplierEmail")}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                Line items <span style={{ color: "var(--brass)" }}>*</span>
              </label>
              <button
                type="button"
                onClick={addRow}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Row
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block rounded-xl border overflow-x-auto" style={{ borderColor: "var(--border)" }}>
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
                  {fields.map((fieldItem, idx) => {
                    const qtyVal = watchedItems?.[idx]?.qty || 0;
                    const rateVal = watchedItems?.[idx]?.rate || 0;
                    const lineTotal = Number(qtyVal) * Number(rateVal);

                    const { ref: partNoRef, ...partNoProps } = form.register(`items.${idx}.partNumber`);
                    const { ref: nameRef, ...nameProps } = form.register(`items.${idx}.name`);
                    const { ref: qtyRef, ...qtyProps } = form.register(`items.${idx}.qty`, { valueAsNumber: true });
                    const { ref: rateRef, ...rateProps } = form.register(`items.${idx}.rate`, { valueAsNumber: true });

                    return (
                      <tr key={fieldItem.id} style={{ borderTop: idx > 0 ? "1px solid var(--border)" : undefined }}>
                        <td className="px-2 py-2 text-center text-xs font-mono-nums font-semibold" style={{ color: "var(--muted-foreground)" }}>
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            {...partNoProps}
                            ref={(el) => {
                              partNoRef(el);
                              setInputRef(idx, "partNumber", el);
                            }}
                            placeholder="Part number"
                            onKeyDown={(e) => handlePartNumberKeyDown(e, idx)}
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none font-mono-nums focus:border-accent"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            {...nameProps}
                            ref={(el) => {
                              nameRef(el);
                              setInputRef(idx, "name", el);
                            }}
                            placeholder="Description"
                            onKeyDown={(e) => handleNameKeyDown(e, idx)}
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none focus:border-accent"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            {...qtyProps}
                            ref={(el) => {
                              qtyRef(el);
                              setInputRef(idx, "qty", el);
                            }}
                            onKeyDown={(e) => handleQtyKeyDown(e, idx)}
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none text-right font-mono-nums focus:border-accent"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            {...rateProps}
                            ref={(el) => {
                              rateRef(el);
                              setInputRef(idx, "rate", el);
                            }}
                            onKeyDown={(e) => handleRateKeyDown(e, idx)}
                            className="w-full px-2.5 py-1.5 rounded-md border text-sm outline-none text-right font-mono-nums focus:border-accent"
                            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-mono-nums text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          {lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-2.5 py-2 text-center">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-raised"
                              style={{ color: "var(--muted-foreground)" }}
                              title="Delete row"
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

            {/* Mobile Card List View */}
            <div className="sm:hidden space-y-2.5">
              {isFirstItemUntouched ? (
                /* Clean Empty State CTA on Mobile when no items added yet */
                <div
                  onClick={openDrawerForNew}
                  className="rounded-xl border p-5 text-center cursor-pointer transition-all hover:bg-surface-raised space-y-2"
                  style={{
                    borderColor: "var(--border)",
                    borderStyle: "dashed",
                    background: "var(--surface)",
                  }}
                >
                  <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Add First Line Item</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Tap to enter part number, description, quantity & rate</p>
                  </div>
                </div>
              ) : (
                <>
                  {fields.map((fieldItem, idx) => {
                    const item = watchedItems?.[idx];
                    const lineTotal = (Number(item?.qty) || 0) * (Number(item?.rate) || 0);

                    return (
                      <div
                        key={fieldItem.id}
                        className="rounded-xl border p-3.5 space-y-2 transition-colors hover:bg-surface-raised cursor-pointer"
                        style={{
                          background: "var(--surface)",
                          borderColor: "var(--border)",
                        }}
                        onClick={() => setActiveDrawerIndex(idx)}
                      >
                        {/* Header: Sl No + Part Number + Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono-nums font-medium" style={{ color: "var(--muted-foreground)" }}>
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-sm font-mono-nums truncate" style={{ color: "var(--accent)" }}>
                              {item?.partNumber || "No Part #"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Pencil Edit Icon */}
                            <button
                              type="button"
                              onClick={() => setActiveDrawerIndex(idx)}
                              className="p-1 cursor-pointer transition-opacity hover:opacity-75"
                              style={{ color: "var(--accent)" }}
                              title="Edit Item"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            {/* Delete Icon */}
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(idx)}
                                className="p-1 text-xs cursor-pointer transition-opacity hover:opacity-75"
                                style={{ color: "var(--muted-foreground)" }}
                                title="Remove Item"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {item?.name && (
                          <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
                            {item.name}
                          </p>
                        )}

                        {/* Qty, Rate & Line Total */}
                        <div className="flex items-center justify-between pt-2 text-sm font-mono-nums border-t" style={{ borderColor: "var(--border)" }}>
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>
                            {Number(item?.qty) || 1} <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>×</span> {(Number(item?.rate) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="font-bold text-base" style={{ color: "var(--accent)" }}>
                            {lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={openDrawerForNew}
                    className="w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Row
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              Notes & Terms <span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="e.g. Validity period, payment terms, or special instructions..."
              {...form.register("notes")}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none transition-all focus:border-accent"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        {/* Right Column Summary Rail */}
        <SummaryRail
          totals={computeTotals(
            (watchedItems || []).map((i) => ({
              qty: (i.qty || 0).toString(),
              rate: (i.rate || 0).toString(),
              taxPercent: "0",
            }))
          )}
          isEditing={isEditing}
          isPending={isPending}
          register={form.register}
        />
      </div>

      {/* Mobile Drawer Editor */}
      {activeDrawerIndex !== null && watchedItems?.[activeDrawerIndex] && (
        <ItemDrawer
          isOpen={activeDrawerIndex !== null}
          item={{
            partNumber: watchedItems[activeDrawerIndex]?.partNumber || "",
            name: watchedItems[activeDrawerIndex]?.name || "",
            qty: Number(watchedItems[activeDrawerIndex]?.qty || 1),
            rate: Number(watchedItems[activeDrawerIndex]?.rate || 0),
          }}
          itemIndex={activeDrawerIndex}
          onSave={(updated) => {
            form.setValue(`items.${activeDrawerIndex}.partNumber`, updated.partNumber);
            form.setValue(`items.${activeDrawerIndex}.name`, updated.name);
            form.setValue(`items.${activeDrawerIndex}.qty`, updated.qty);
            form.setValue(`items.${activeDrawerIndex}.rate`, updated.rate);
            setActiveDrawerIndex(null);
          }}
          onClose={() => setActiveDrawerIndex(null)}
        />
      )}
    </form>
  );
}

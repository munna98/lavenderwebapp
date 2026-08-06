"use client";

import { useEffect, useRef, useState } from "react";

export type DrawerItem = {
  partNumber: string;
  name: string;
  qty: number;
  rate: number;
};

type Props = {
  isOpen: boolean;
  item: DrawerItem | null;
  itemIndex: number; // 0-indexed item number (e.g. 0 for #1, 1 for #2)
  isNew?: boolean;   // true when adding a new item, false when editing
  requirePartNumber?: boolean;
  requireName?: boolean;
  onSave: (item: DrawerItem, index: number | null) => void;
  onClose: () => void;
};

export default function ItemDrawer({
  isOpen,
  item,
  itemIndex,
  isNew = false,
  requirePartNumber = true,
  requireName = false,
  onSave,
  onClose,
}: Props) {
  const [partNumber, setPartNumber] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [rate, setRate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const partNumberRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Sync state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setPartNumber(item?.partNumber ?? "");
      setName(item?.name ?? "");
      setQty(item?.qty?.toString() ?? "1");
      setRate(item?.rate ? item.rate.toString() : "");
      setError(null);
      // Focus field after animation
      setTimeout(() => {
        if (requirePartNumber) {
          partNumberRef.current?.focus();
        } else {
          nameRef.current?.focus();
        }
      }, 120);
    }
  }, [isOpen, item, requirePartNumber]);

  // ESC key closes
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleSave() {
    const cleanPartNo = partNumber.trim().replace(/\s+/g, "");
    if (requirePartNumber && !cleanPartNo) {
      setError("Part number is required.");
      partNumberRef.current?.focus();
      return;
    }
    const cleanName = name.trim();
    if (requireName && !cleanName) {
      setError("Description is required.");
      nameRef.current?.focus();
      return;
    }
    const parsedQty = parseFloat(qty);
    const parsedRate = parseFloat(rate);
    if (!parsedQty || parsedQty <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    setError(null);
    onSave(
      {
        partNumber: cleanPartNo,
        name: cleanName,
        qty: parsedQty,
        rate: isNaN(parsedRate) ? 0 : parsedRate,
      },
      isNew ? null : itemIndex
    );
  }

  const lineTotal = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out max-w-md mx-auto"
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--border-strong)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-md text-xs font-mono-nums font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              #{itemIndex + 1}
            </span>
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
              {isNew ? "Add Line Item" : "Edit Line Item"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-surface-raised cursor-pointer"
            style={{ color: "var(--muted-foreground)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form fields */}
        <div className="px-5 pt-4 pb-3 space-y-4">
          {/* Error */}
          {error && (
            <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FCA5A5" }}>
              {error}
            </p>
          )}

          {/* Part Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Part # {requirePartNumber ? <span style={{ color: "var(--brass)" }}>*</span> : <span className="font-normal lowercase" style={{ color: "var(--muted-foreground-soft)" }}>(optional)</span>}
            </label>
            <input
              ref={partNumberRef}
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value.replace(/\s+/g, ""))}
              placeholder="Part number"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono-nums outline-none transition-all focus:border-accent"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
              Description {requireName ? <span style={{ color: "var(--brass)" }}>*</span> : <span className="font-normal lowercase" style={{ color: "var(--muted-foreground-soft)" }}>(optional)</span>}
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item description"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:border-accent"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
            />
          </div>

          {/* Qty + Rate side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Qty
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                step="any"
                min="0.0001"
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono-nums text-right outline-none transition-all focus:border-accent"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Rate
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                step="any"
                min="0"
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono-nums text-right outline-none transition-all focus:border-accent"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--foreground)" }}
              />
            </div>
          </div>

          {/* Line total preview */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Line Total</span>
            <span className="text-base font-bold font-mono-nums" style={{ color: "var(--accent)" }}>
              {lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-5 pb-8 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer hover:bg-surface-raised"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--surface)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {isNew ? "Add Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

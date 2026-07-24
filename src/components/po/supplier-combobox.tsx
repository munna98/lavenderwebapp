"use client";

import { useState, useRef, useEffect } from "react";
import type { Supplier } from "@prisma/client";

type Props = {
  suppliers: Supplier[];
  value: string;
  onChange: (value: string) => void;
  onEnterNext?: () => void;
};

export default function SupplierCombobox({ suppliers, value, onChange, onEnterNext }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = suppliers.find((s) => s.id === value);

  const filtered = query
    ? suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email?.toLowerCase().includes(query.toLowerCase())
      )
    : suppliers;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(supplierId: string) {
    onChange(supplierId);
    setOpen(false);
    setQuery("");
    if (onEnterNext) {
      setTimeout(onEnterNext, 50);
    }
  }

  function handleOpenToggle() {
    setOpen((prev) => !prev);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter") {
      if (value && !open) {
        e.preventDefault();
        onEnterNext?.();
      } else if (!open) {
        e.preventDefault();
        handleOpenToggle();
      }
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0].id);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        id="supplier-combobox-trigger"
        onClick={handleOpenToggle}
        onKeyDown={handleTriggerKeyDown}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm text-left outline-none cursor-pointer transition-all"
        style={{
          borderColor: open ? "var(--accent)" : "var(--border)",
          background: "var(--surface)",
          color: selected ? "var(--foreground)" : "var(--muted-foreground)",
          boxShadow: open ? "0 0 0 3px rgba(31,92,78,0.12)" : undefined,
        }}
      >
        <span>{selected ? selected.name : "Select a supplier…"}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full mt-1 w-full rounded-xl border shadow-lg overflow-hidden"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {/* Search */}
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search suppliers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border outline-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-raised)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Options */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                No suppliers found
              </li>
            ) : (
              filtered.map((supplier) => (
                <li key={supplier.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(supplier.id)}
                    className="w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors"
                    style={{
                      background: supplier.id === value ? "var(--accent-soft)" : "transparent",
                      color: supplier.id === value ? "var(--accent)" : "var(--foreground)",
                    }}
                    onMouseEnter={(e) => {
                      if (supplier.id !== value)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "var(--surface-raised)";
                    }}
                    onMouseLeave={(e) => {
                      if (supplier.id !== value)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                    }}
                  >
                    <div className="font-medium">{supplier.name}</div>
                    {supplier.email && (
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {supplier.email}
                      </div>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

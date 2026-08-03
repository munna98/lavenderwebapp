"use client";

import { useState, useRef, useEffect } from "react";
import type { Customer } from "@prisma/client";

type Props = {
  customers: Customer[];
  selectedCustomerId: string;
  onSelect: (customerId: string, customerEmail?: string) => void;
  error?: string;
  onEnterNext?: () => void;
};

export default function CustomerCombobox({
  customers,
  selectedCustomerId,
  onSelect,
  error,
  onEnterNext,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = customers.find((c) => c.id === selectedCustomerId);

  const filtered = query
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email?.toLowerCase().includes(query.toLowerCase()) ||
          c.phone?.includes(query)
      )
    : customers;

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

  function handleSelect(customer: Customer) {
    onSelect(customer.id, customer.email ?? undefined);
    setOpen(false);
    setQuery("");
    if (onEnterNext) {
      setTimeout(onEnterNext, 50);
    }
  }

  function handleOpenToggle() {
    setOpen((prev) => !prev);
    if (!open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter") {
      if (selectedCustomerId && !open) {
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
      handleSelect(filtered[0]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="customer-combobox-trigger" className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
        Customer <span style={{ color: "var(--brass)" }}>*</span>
      </label>

      {/* Trigger */}
      <button
        type="button"
        id="customer-combobox-trigger"
        onClick={handleOpenToggle}
        onKeyDown={handleTriggerKeyDown}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm text-left outline-none cursor-pointer transition-all"
        style={{
          borderColor: error ? "#EF4444" : open ? "var(--accent)" : "var(--border)",
          background: "var(--surface)",
          color: selected ? "var(--foreground)" : "var(--muted-foreground)",
          boxShadow: open ? "0 0 0 3px rgba(31,92,78,0.12)" : undefined,
        }}
      >
        <span>{selected ? selected.name : "Select a customer…"}</span>
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

      {error && (
        <p className="text-xs font-medium mt-1" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}

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
              placeholder="Search customers…"
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
                No customers found matching &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className="w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between"
                    style={{
                      background: customer.id === selectedCustomerId ? "var(--accent-soft)" : "transparent",
                      color: customer.id === selectedCustomerId ? "var(--accent)" : "var(--foreground)",
                    }}
                    onMouseEnter={(e) => {
                      if (customer.id !== selectedCustomerId)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "var(--surface-raised)";
                    }}
                    onMouseLeave={(e) => {
                      if (customer.id !== selectedCustomerId)
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                    }}
                  >
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {customer.email}
                        </div>
                      )}
                    </div>
                    {customer.id === selectedCustomerId && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
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

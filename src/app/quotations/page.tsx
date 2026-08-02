import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Quotations — Lavender Auto Parts",
};

export default function QuotationsPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-sm border"
          style={{ background: "var(--accent-soft)", borderColor: "var(--border)" }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Coming Soon
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Sales Quotations is currently under active development and will be available in an upcoming update.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link
            href="/po"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Purchase Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoadingPoDetail() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-36 rounded-lg" style={{ background: "var(--surface-raised)" }} />
            <div className="h-6 w-20 rounded-full" style={{ background: "var(--surface-raised)" }} />
          </div>
          <div className="h-4 w-60 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-9 w-32 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-9 w-24 rounded-lg" style={{ background: "var(--surface-raised)" }} />
        </div>
      </div>

      {/* Two-Column Detail Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Supplier & Notes */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="h-3 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-5 w-40 rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-4 w-3/4 rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-4 w-1/2 rounded" style={{ background: "var(--surface-raised)" }} />
          </div>

          <div className="rounded-xl border p-5 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="h-3 w-28 rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-4 w-full rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-4 w-5/6 rounded" style={{ background: "var(--surface-raised)" }} />
          </div>
        </div>

        {/* Right Column: Line Items Table & Totals */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-full" style={{ background: "var(--surface-raised)" }} />
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center gap-4">
                  <div className="h-4 w-12 rounded" style={{ background: "var(--surface-raised)" }} />
                  <div className="h-4 w-32 rounded" style={{ background: "var(--surface-raised)" }} />
                  <div className="h-4 flex-1 rounded" style={{ background: "var(--surface-raised)" }} />
                  <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
                  <div className="h-4 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Summary Box */}
          <div className="rounded-xl border p-5 max-w-xs ml-auto space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
            <div className="border-t pt-3 flex justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="h-5 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-6 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

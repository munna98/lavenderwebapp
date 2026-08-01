export default function LoadingSupplierDetail() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-36 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-raised)" }} />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="h-3 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-36 rounded" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-28 rounded" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-44 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
          </div>

          <div className="rounded-xl overflow-hidden space-y-2">
            <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

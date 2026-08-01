export default function LoadingPoList() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-28 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>
        <div className="h-9 w-32 rounded-lg" style={{ background: "var(--surface-raised)" }} />
      </div>

      {/* Filter Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 rounded-lg" style={{ background: "var(--surface-raised)" }} />
        <div className="h-10 w-36 rounded-lg" style={{ background: "var(--surface-raised)" }} />
        <div className="h-10 w-40 rounded-lg" style={{ background: "var(--surface-raised)" }} />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="h-11 w-full" style={{ background: "var(--surface-raised)" }} />
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="h-4 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-40 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-28 rounded hidden md:block" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-24 rounded hidden sm:block" style={{ background: "var(--surface-raised)" }} />
              <div className="h-5 w-16 rounded-full" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-48 rounded" style={{ background: "var(--surface-raised)" }} />
        <div className="h-8 w-40 rounded-lg" style={{ background: "var(--surface-raised)" }} />
      </div>
    </div>
  );
}

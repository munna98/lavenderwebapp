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
      <div className="rounded-xl overflow-hidden space-y-2">
        <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-4 w-48 rounded" style={{ background: "var(--surface-raised)" }} />
        <div className="h-8 w-40 rounded-lg" style={{ background: "var(--surface-raised)" }} />
      </div>
    </div>
  );
}

export default function LoadingPoDetail() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Bar Skeleton */}
      <div className="flex justify-between items-center border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-48 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-9 w-32 rounded-lg" style={{ background: "var(--surface-raised)" }} />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-48 rounded-xl" style={{ background: "var(--surface-raised)" }} />
        <div className="md:col-span-2 space-y-4">
          <div className="h-64 rounded-xl" style={{ background: "var(--surface-raised)" }} />
          <div className="h-16 w-48 ml-auto rounded-xl" style={{ background: "var(--surface-raised)" }} />
        </div>
      </div>
    </div>
  );
}

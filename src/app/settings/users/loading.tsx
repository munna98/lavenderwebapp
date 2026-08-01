export default function LoadingUsers() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-48 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>
        <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-raised)" }} />
      </div>

      {/* Users Table Skeleton */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="h-11 w-full" style={{ background: "var(--surface-raised)" }} />
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="h-4 w-32 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-48 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-6 w-20 rounded-md" style={{ background: "var(--surface-raised)" }} />
              <div className="h-5 w-16 rounded-full" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoadingUsers() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 rounded-lg" style={{ background: "var(--surface-raised)" }} />
          <div className="h-4 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
        </div>
        <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-raised)" }} />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {/* Table header */}
        <div className="h-11 w-full" style={{ background: "var(--surface-raised)" }} />

        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="px-4 py-4 flex items-center justify-between gap-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {/* Name */}
            <div className="h-4 rounded" style={{ background: "var(--surface-raised)", width: "18%" }} />
            {/* Email */}
            <div className="h-4 rounded" style={{ background: "var(--surface-raised)", width: "30%" }} />
            {/* Role pill */}
            <div className="h-6 w-16 rounded-md" style={{ background: "var(--surface-raised)" }} />
            {/* Status badge */}
            <div className="h-5 w-14 rounded-full" style={{ background: "var(--surface-raised)" }} />
            {/* Action */}
            <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

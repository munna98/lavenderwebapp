export default function LoadingNewPo() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Title Skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-7 w-48 rounded-lg" style={{ background: "var(--surface-raised)" }} />
        <div className="h-4 w-72 rounded" style={{ background: "var(--surface-raised)" }} />
      </div>

      {/* Main Form Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Pane: Inputs & Line Items Table */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* Supplier & Email Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
            </div>
          </div>

          {/* Line Items Header & Table Skeleton */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>

            {/* Table skeleton with smooth rounded rows, no harsh grid lines */}
            <div className="rounded-xl overflow-hidden space-y-2">
              <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
              <div className="h-12 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
              <div className="h-12 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
            </div>
          </div>

          {/* Notes Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
            <div className="h-24 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
          </div>
        </div>

        {/* Right Summary Rail Skeleton */}
        <div className="w-full lg:w-80 rounded-xl p-5 space-y-4 shrink-0" style={{ background: "var(--surface)" }}>
          <div className="h-4 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
          <div className="space-y-3 pt-2">
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-4 w-16 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
            <div className="flex justify-between pt-2">
              <div className="h-5 w-20 rounded" style={{ background: "var(--surface-raised)" }} />
              <div className="h-6 w-24 rounded" style={{ background: "var(--surface-raised)" }} />
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
            <div className="h-10 w-full rounded-lg" style={{ background: "var(--surface-raised)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

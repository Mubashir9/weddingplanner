export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded bg-[var(--color-border)] animate-pulse" />
          <div className="h-4 w-64 rounded bg-[var(--color-border)] animate-pulse" />
        </div>
        <div className="h-16 w-24 rounded bg-[var(--color-border)] animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-[var(--radius-md)] space-y-3"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <div className="h-3 w-16 rounded bg-[var(--color-border)] animate-pulse" />
            <div className="h-7 w-20 rounded bg-[var(--color-border)] animate-pulse" />
            <div className="h-3 w-12 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="h-3 w-16 rounded bg-[var(--color-border)] animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-5 rounded bg-[var(--color-border)] animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-[var(--color-border)] animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 border rounded-[var(--radius-md)] bg-[var(--color-border)] animate-pulse"
              style={{ borderColor: 'var(--color-border)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

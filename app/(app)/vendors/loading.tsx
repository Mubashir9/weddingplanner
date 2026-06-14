export default function VendorsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-24 rounded bg-[var(--color-border)] animate-pulse" />

      <div className="flex gap-3">
        <div className="h-8 w-28 rounded bg-[var(--color-border)] animate-pulse" />
        <div className="h-8 w-32 rounded bg-[var(--color-border)] animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-[var(--radius-md)] space-y-3"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-[var(--color-border)] animate-pulse" />
                <div className="h-3 w-20 rounded bg-[var(--color-border)] animate-pulse" />
              </div>
              <div className="h-5 w-16 rounded-full bg-[var(--color-border)] animate-pulse" />
            </div>
            <div className="h-4 w-24 rounded bg-[var(--color-border)] animate-pulse" />
            <div className="h-3 w-28 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

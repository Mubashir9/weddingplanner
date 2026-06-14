export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-24 rounded-[var(--radius-sm)] bg-[var(--color-border)] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-[var(--radius-md)] overflow-hidden animate-pulse"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <div className="h-1.5 w-full bg-[var(--color-border)]" />
            <div className="p-5 space-y-4">
              <div className="h-7 w-28 bg-[var(--color-border)] rounded" />
              <div className="space-y-3">
                <div className="h-4 w-48 bg-[var(--color-border)] rounded" />
                <div className="h-4 w-36 bg-[var(--color-border)] rounded" />
                <div className="h-16 w-full bg-[var(--color-border)] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

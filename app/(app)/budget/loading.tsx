export default function BudgetLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-20 rounded bg-[var(--color-border)] animate-pulse" />

      <div
        className="p-5 border rounded-[var(--radius-md)] space-y-2"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="h-3 w-20 rounded bg-[var(--color-border)] animate-pulse" />
        <div className="h-10 w-48 rounded bg-[var(--color-border)] animate-pulse" />
      </div>

      {['Nikkah', 'Shaadi', 'Valima'].map((name) => (
        <section key={name}>
          <div className="flex justify-between mb-2">
            <div className="h-6 w-24 rounded bg-[var(--color-border)] animate-pulse" />
            <div className="h-4 w-20 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
          <div
            className="border rounded-[var(--radius-md)] overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              >
                <div className="size-4 rounded border bg-[var(--color-border)] animate-pulse shrink-0" />
                <div className="flex-1 h-4 rounded bg-[var(--color-border)] animate-pulse" />
                <div className="h-4 w-20 rounded bg-[var(--color-border)] animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

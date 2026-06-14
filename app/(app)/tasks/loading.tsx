export default function TasksLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-20 rounded bg-[var(--color-border)] animate-pulse" />

      {['Nikkah', 'Shaadi', 'Valima'].map((name) => (
        <section key={name}>
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 w-28 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
          <div
            className="border rounded-[var(--radius-md)] overflow-hidden"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="space-y-1.5">
                  <div className="h-4 w-48 rounded bg-[var(--color-border)] animate-pulse" />
                  <div className="h-3 w-24 rounded bg-[var(--color-border)] animate-pulse" />
                </div>
                <div className="h-5 w-16 rounded-full bg-[var(--color-border)] animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

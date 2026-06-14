import { createClient } from '@/lib/supabase/server'
import { DaysCounter } from '@/components/days-counter'
import { NudgePanel } from '@/components/nudge-panel'
import type { Nudge, Task, Vendor, BudgetItem, Event } from '@/types'

async function getWeddingData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('wedding_members')
    .select('wedding_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return null
  const weddingId = member.wedding_id

  const [
    { data: events },
    { data: tasks },
    { data: vendors },
    { data: budgetItems },
    { data: nudgesRow },
  ] = await Promise.all([
    supabase.from('events').select('*').eq('wedding_id', weddingId).order('event_date'),
    supabase.from('tasks').select('*').eq('wedding_id', weddingId),
    supabase.from('vendors').select('*').eq('wedding_id', weddingId),
    supabase.from('budget_items').select('*').eq('wedding_id', weddingId),
    supabase
      .from('ai_nudges')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    weddingId,
    events: (events ?? []) as Event[],
    tasks: (tasks ?? []) as Task[],
    vendors: (vendors ?? []) as Vendor[],
    budgetItems: (budgetItems ?? []) as BudgetItem[],
      nudges: (nudgesRow?.nudges ?? []) as Nudge[],
  }
}

export default async function DashboardPage() {
  const data = await getWeddingData()

  if (!data) {
    return (
      <div className="text-sm text-[var(--color-text-muted)]">
        Could not load wedding data. Make sure your account is linked to a wedding.
      </div>
    )
  }

  const { events, tasks, vendors, budgetItems, nudges, weddingId } = data

  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const tasksPercent = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0
  const totalSpent = budgetItems.reduce((s, b) => s + Number(b.amount), 0)
  const bookedVendors = vendors.filter((v) => v.status === 'booked').length

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'done' && t.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .slice(0, 5)

  const getEventName = (id: string) => events.find((e) => e.id === id)?.name ?? '—'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-3xl font-medium"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Nikkah · Dec 18 &nbsp;·&nbsp; Shaadi · Dec 20 &nbsp;·&nbsp; Valima · Dec 22
          </p>
        </div>
        <DaysCounter />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tasks done"
          value={`${tasksPercent}%`}
          sub={`${doneTasks} / ${tasks.length}`}
        />
        <StatCard
          label="Budget spent"
          value={formatPKR(totalSpent)}
          sub="PKR total"
        />
        <StatCard
          label="Vendors"
          value={String(vendors.length)}
          sub={`${bookedVendors} booked`}
        />
        <StatCard
          label="Events"
          value={String(events.length)}
          sub={events.filter((e) => e.venue).length + ' venues set'}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Nudges */}
        <section>
          <NudgesSection weddingId={weddingId} initialNudges={nudges} />
        </section>

        {/* Upcoming tasks */}
        <section>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
            Upcoming tasks
          </h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No upcoming tasks with due dates.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-[var(--radius-md)]"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)]">{task.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{getEventName(task.event_id)}</p>
                  </div>
                  {task.due_date && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {new Date(task.due_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      className="p-4 border rounded-[var(--radius-md)]"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">{label}</p>
      <p
        className="text-2xl font-medium"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
      >
        {value}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>
    </div>
  )
}

function NudgesSection({
  weddingId,
  initialNudges,
}: {
  weddingId: string
  initialNudges: Nudge[]
}) {
  return (
    <>
      <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
        AI Nudges
      </h2>
      <NudgePanel nudges={initialNudges} />
      <p className="text-xs text-[var(--color-text-muted)] mt-3">
        Refreshed every 6 hours ·{' '}
        <a href="/api/nudges?refresh=1" className="underline hover:text-[var(--color-text-secondary)]">
          Refresh now
        </a>
      </p>
    </>
  )
}

function formatPKR(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`
  return String(amount)
}

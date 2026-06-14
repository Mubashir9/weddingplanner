import { createClient } from '@/lib/supabase/server'
import { TasksClient } from '@/components/tasks-client'
import type { Event, Task } from '@/types'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('wedding_members')
    .select('wedding_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Your account is not linked to a wedding yet.
      </p>
    )
  }

  const weddingId = member.wedding_id

  const [{ data: events }, { data: tasks }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('event_date'),
    supabase.from('tasks').select('*').eq('wedding_id', weddingId).order('created_at'),
  ])

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-medium"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
      >
        Tasks
      </h1>
      <TasksClient
        events={(events ?? []) as Event[]}
        initialTasks={(tasks ?? []) as Task[]}
        weddingId={weddingId}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { EventsClient } from '@/components/events-client'
import type { Event } from '@/types'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('wedding_members')
    .select('wedding_id')
    .eq('user_id', user.id)
    .single()

  if (!member) return null

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('wedding_id', member.wedding_id)
    .order('event_date')

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-medium"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
      >
        Events
      </h1>
      <EventsClient initialEvents={(events ?? []) as Event[]} />
    </div>
  )
}

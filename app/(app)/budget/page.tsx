import { createClient } from '@/lib/supabase/server'
import { BudgetClient } from '@/components/budget-client'
import type { Event, BudgetItem, Vendor } from '@/types'

export default async function BudgetPage() {
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

  const [{ data: events }, { data: items }, { data: vendors }] = await Promise.all([
    supabase.from('events').select('*').eq('wedding_id', weddingId).order('event_date'),
    supabase.from('budget_items').select('*').eq('wedding_id', weddingId).order('created_at'),
    supabase.from('vendors').select('id, name').eq('wedding_id', weddingId),
  ])

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-medium"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
      >
        Budget
      </h1>
      <BudgetClient
        events={(events ?? []) as Event[]}
        initialItems={(items ?? []) as BudgetItem[]}
        vendors={(vendors ?? []) as Pick<Vendor, 'id' | 'name'>[]}
        weddingId={weddingId}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { VendorsClient } from '@/components/vendors-client'
import type { Event, Vendor } from '@/types'

export default async function VendorsPage() {
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

  const [{ data: events }, { data: vendors }] = await Promise.all([
    supabase.from('events').select('*').eq('wedding_id', weddingId).order('event_date'),
    supabase.from('vendors').select('*').eq('wedding_id', weddingId).order('created_at'),
  ])

  return (
    <div className="space-y-6">
      <h1
        className="text-3xl font-medium"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
      >
        Vendors
      </h1>
      <VendorsClient
        events={(events ?? []) as Event[]}
        initialVendors={(vendors ?? []) as Vendor[]}
        weddingId={weddingId}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VendorCard } from '@/components/vendor-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Vendor, Event, VendorCategory, VendorStatus, BudgetCategory } from '@/types'
import { Plus } from 'lucide-react'

interface VendorsClientProps {
  events: Event[]
  initialVendors: Vendor[]
  weddingId: string
}

const CATEGORIES: VendorCategory[] = [
  'catering', 'photography', 'mehendi', 'attire_bride', 'attire_groom',
  'decor', 'band_dhol', 'makeup', 'transport', 'other',
]

const VENDOR_TO_BUDGET_CATEGORY: Partial<Record<VendorCategory, BudgetCategory>> = {
  catering: 'catering',
  photography: 'photography',
  attire_bride: 'attire',
  attire_groom: 'attire',
  decor: 'decor',
}

export function VendorsClient({ events, initialVendors, weddingId }: VendorsClientProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'other' as VendorCategory,
    event_id: '' as string,
    instagram_url: '',
    phone: '',
    quote: '',
    notes: '',
    status: 'shortlisted' as VendorStatus,
  })

  const filtered = vendors.filter((v) => {
    if (filterEvent !== 'all' && v.event_id !== filterEvent) return false
    if (filterCategory !== 'all' && v.category !== filterCategory) return false
    return true
  })

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        wedding_id: weddingId,
        name: form.name,
        category: form.category,
        event_id: form.event_id || null,
        instagram_url: form.instagram_url || null,
        phone: form.phone || null,
        quote: form.quote ? Number(form.quote) : null,
        notes: form.notes || null,
        status: form.status,
      })
      .select()
      .single()

    if (!error && data) {
      const newVendor = data as Vendor
      setVendors((prev) => [...prev, newVendor])

      // If added directly as booked with a quote, auto-add to budget
      if (form.status === 'booked' && form.quote) {
        await maybeAddToBudget(newVendor)
      }

      setOpen(false)
      setForm({ name: '', category: 'other', event_id: '', instagram_url: '', phone: '', quote: '', notes: '', status: 'shortlisted' })
    }
  }

  async function maybeAddToBudget(vendor: Vendor) {
    if (!vendor.quote) return
    const supabase = createClient()

    const { data: existing } = await supabase
      .from('budget_items')
      .select('id')
      .eq('vendor_id', vendor.id)
      .maybeSingle()

    if (!existing) {
      await supabase.from('budget_items').insert({
        wedding_id: weddingId,
        vendor_id: vendor.id,
        event_id: vendor.event_id,
        label: vendor.name,
        amount: vendor.quote,
        category: vendor.category ? (VENDOR_TO_BUDGET_CATEGORY[vendor.category] ?? 'misc') : 'misc',
        paid: false,
        currency: 'PKR',
      })
    }
  }

  async function handleStatusChange(id: string, status: VendorStatus) {
    const supabase = createClient()
    await supabase.from('vendors').update({ status }).eq('id', id)
    const updated = vendors.find((v) => v.id === id)
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)))

    if (status === 'booked' && updated) {
      await maybeAddToBudget({ ...updated, status })
    }
  }

  async function handleDelete(id: string) {
    setVendors((prev) => prev.filter((v) => v.id !== id))
    const supabase = createClient()
    await supabase.from('vendors').delete().eq('id', id)
  }

  const getEventName = (id: string | null) =>
    id ? events.find((e) => e.id === id)?.name : undefined

  return (
    <div className="space-y-6">
      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="text-sm h-8 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="all">All events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm h-8 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="h-8 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)]"
              >
                <Plus size={14} />
                Add vendor
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add vendor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-3 mt-2">
              <Input
                placeholder="Vendor name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as VendorCategory })}
                  className="text-sm h-9 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
                <select
                  value={form.event_id}
                  onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                  className="text-sm h-9 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value="">All events</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Instagram URL"
                value={form.instagram_url}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  placeholder="Quote (PKR)"
                  type="number"
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                />
              </div>
              <Input
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VendorStatus })}
                className="w-full text-sm h-9 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <option value="shortlisted">Shortlisted</option>
                <option value="contacted">Contacted</option>
                <option value="booked">Booked</option>
              </select>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-[var(--radius-sm)]">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)]">
                  Add vendor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[var(--color-text-muted)]">
            No vendors here yet. Save vendors you find on Instagram.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="mt-3 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)]"
          >
            Add first vendor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <VendorCard
              key={v.id}
              vendor={v}
              eventName={getEventName(v.event_id)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

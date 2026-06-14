'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BudgetItem, Event, BudgetCategory, Vendor } from '@/types'
import { Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetClientProps {
  events: Event[]
  initialItems: BudgetItem[]
  vendors: Pick<Vendor, 'id' | 'name'>[]
  weddingId: string
}

const CATEGORIES: BudgetCategory[] = ['catering', 'attire', 'decor', 'photography', 'misc']

export function BudgetClient({ events, initialItems, vendors, weddingId }: BudgetClientProps) {
  const [items, setItems] = useState<BudgetItem[]>(initialItems)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    label: '',
    amount: '',
    category: 'misc' as BudgetCategory,
    event_id: '',
    paid: false,
  })

  const totalSpent = items.reduce((s, i) => s + Number(i.amount), 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label || !form.amount) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('budget_items')
      .insert({
        wedding_id: weddingId,
        label: form.label,
        amount: Number(form.amount),
        category: form.category,
        event_id: form.event_id || null,
        vendor_id: null,
        paid: form.paid,
        currency: 'PKR',
      })
      .select()
      .single()

    if (!error && data) {
      setItems((prev) => [...prev, data as BudgetItem])
      setForm({ label: '', amount: '', category: 'misc', event_id: '', paid: false })
      setAdding(false)
    }
  }

  async function togglePaid(id: string, paid: boolean) {
    const supabase = createClient()
    await supabase.from('budget_items').update({ paid: !paid }).eq('id', id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, paid: !paid } : i)))
  }

  // Group by event (+ general)
  const groups = [
    ...events.map((e) => ({
      label: e.name,
      id: e.id,
      items: items.filter((i) => i.event_id === e.id),
    })),
    {
      label: 'General',
      id: null,
      items: items.filter((i) => !i.event_id),
    },
  ].filter((g) => g.items.length > 0 || g.id === null)

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div
        className="p-5 border rounded-[var(--radius-md)]"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">
              Total spent
            </p>
            <p
              className="text-4xl font-medium"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
            >
              PKR {totalSpent.toLocaleString('en-PK')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)]">
              {items.filter((i) => i.paid).length} / {items.length} paid
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {items.length} line items
            </p>
          </div>
        </div>
      </div>

      {/* Per-event groups */}
      {groups.map((group) => (
        <section key={group.id ?? 'general'}>
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-xl font-medium"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
            >
              {group.label}
            </h2>
            <span className="text-sm text-[var(--color-text-muted)]">
              PKR{' '}
              {group.items
                .reduce((s, i) => s + Number(i.amount), 0)
                .toLocaleString('en-PK')}
            </span>
          </div>
          <div
            className="border rounded-[var(--radius-md)] overflow-hidden"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {group.items.map((item) => (
              <BudgetRow key={item.id} item={item} vendors={vendors} onTogglePaid={togglePaid} />
            ))}
          </div>
        </section>
      ))}

      {/* Add item */}
      {adding ? (
        <form
          onSubmit={handleAdd}
          className="border rounded-[var(--radius-md)] p-4 space-y-3"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Label *"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
              autoFocus
            />
            <Input
              placeholder="Amount (PKR) *"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as BudgetCategory })}
              className="text-sm h-9 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.event_id}
              onChange={(e) => setForm({ ...form, event_id: e.target.value })}
              className="text-sm h-9 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">General</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="paid"
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="paid" className="text-sm text-[var(--color-text-secondary)]">
              Already paid
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)]">
              Add item
            </Button>
            <Button type="button" variant="outline" onClick={() => setAdding(false)} className="rounded-[var(--radius-sm)]">
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          onClick={() => setAdding(true)}
          variant="outline"
          className="w-full border-dashed rounded-[var(--radius-md)] text-[var(--color-text-secondary)]"
        >
          <Plus size={14} />
          Add budget item
        </Button>
      )}
    </div>
  )
}

function BudgetRow({
  item,
  vendors,
  onTogglePaid,
}: {
  item: BudgetItem
  vendors: Pick<Vendor, 'id' | 'name'>[]
  onTogglePaid: (id: string, paid: boolean) => void
}) {
  const vendorName = item.vendor_id ? vendors.find((v) => v.id === item.vendor_id)?.name : null

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--color-border)', backgroundColor: item.paid ? 'var(--color-surface)' : 'white' }}
    >
      <button
        onClick={() => onTogglePaid(item.id, item.paid)}
        className={cn(
          'size-4 rounded border flex items-center justify-center shrink-0 transition-colors',
          item.paid
            ? 'border-[var(--color-ok)] bg-green-50'
            : 'border-[var(--color-border)] bg-white'
        )}
      >
        {item.paid && <Check size={10} className="text-[var(--color-ok)]" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm',
            item.paid ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'
          )}
        >
          {item.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.category && (
            <span className="text-xs text-[var(--color-text-muted)] capitalize">{item.category}</span>
          )}
          {vendorName && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              · via {vendorName}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--color-text-primary)] shrink-0">
        PKR {Number(item.amount).toLocaleString('en-PK')}
      </p>
    </div>
  )
}

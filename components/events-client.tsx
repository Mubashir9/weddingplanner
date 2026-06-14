'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Event } from '@/types'
import { CalendarDays, MapPin, FileText, Pencil, Check, X } from 'lucide-react'

interface EventsClientProps {
  initialEvents: Event[]
}

const EVENT_ACCENT: Record<string, string> = {
  Nikkah: '#9b8ec4',
  Shaadi: '#c4748e',
  Valima: '#74a9c4',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function EventCard({ event }: { event: Event }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    event_date: event.event_date,
    venue: event.venue ?? '',
    notes: event.notes ?? '',
  })
  const [saved, setSaved] = useState({ ...form })

  const accent = EVENT_ACCENT[event.name] ?? 'var(--color-accent)'

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('events')
      .update({
        event_date: form.event_date,
        venue: form.venue || null,
        notes: form.notes || null,
      })
      .eq('id', event.id)
    setSaved({ ...form })
    setSaving(false)
    setEditing(false)
  }

  function handleCancel() {
    setForm({ ...saved })
    setEditing(false)
  }

  return (
    <div
      className="border rounded-[var(--radius-md)] overflow-hidden"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      {/* Coloured top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <h2
            className="text-2xl font-medium"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
          >
            {event.name}
          </h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border rounded-[var(--radius-sm)] px-2 py-1"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Pencil size={11} />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-[var(--radius-sm)] text-white"
                style={{ backgroundColor: accent }}
              >
                <Check size={12} />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Date */}
          <div className="flex items-start gap-3">
            <CalendarDays size={15} className="mt-0.5 shrink-0" style={{ color: accent }} />
            {editing ? (
              <Input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="h-8 text-sm max-w-[180px]"
              />
            ) : (
              <p className="text-sm text-[var(--color-text-primary)]">
                {formatDate(saved.event_date)}
              </p>
            )}
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: accent }} />
            {editing ? (
              <Input
                placeholder="Venue name or address"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="h-8 text-sm flex-1"
              />
            ) : (
              <p className="text-sm text-[var(--color-text-primary)]">
                {saved.venue || <span className="text-[var(--color-text-muted)]">No venue set</span>}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="flex items-start gap-3">
            <FileText size={15} className="mt-0.5 shrink-0" style={{ color: accent }} />
            {editing ? (
              <textarea
                placeholder="Notes about this event…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="flex-1 text-sm px-3 py-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)] resize-none focus:outline-none focus:ring-1"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            ) : (
              <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                {saved.notes || <span className="text-[var(--color-text-muted)]">No notes yet</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EventsClient({ initialEvents }: EventsClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {initialEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { Vendor } from '@/types'
import { cn } from '@/lib/utils'
import { Link2, Phone, ExternalLink, Trash2 } from 'lucide-react'

const STATUS_STYLE = {
  shortlisted: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
  contacted: 'bg-blue-50 text-[var(--color-info)]',
  booked: 'bg-green-50 text-[var(--color-ok)]',
}

interface VendorCardProps {
  vendor: Vendor
  eventName?: string
  onStatusChange: (id: string, status: Vendor['status']) => void
  onDelete: (id: string) => void
}

const STATUS_CYCLE: Record<string, Vendor['status']> = {
  shortlisted: 'contacted',
  contacted: 'booked',
  booked: 'shortlisted',
}

export function VendorCard({ vendor, eventName, onStatusChange, onDelete }: VendorCardProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      className="group relative p-4 border rounded-[var(--radius-md)] flex flex-col gap-3"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {vendor.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {vendor.category && (
              <span className="text-xs text-[var(--color-text-muted)] capitalize">
                {vendor.category.replace('_', ' ')}
              </span>
            )}
            {eventName && (
              <span className="text-xs text-[var(--color-text-muted)]">· {eventName}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onStatusChange(vendor.id, STATUS_CYCLE[vendor.status])}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full transition-opacity hover:opacity-80',
              STATUS_STYLE[vendor.status]
            )}
          >
            {vendor.status}
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-destructive)]"
            aria-label="Delete vendor"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {vendor.quote && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          PKR {Number(vendor.quote).toLocaleString('en-PK')}
        </p>
      )}

      <div className="flex items-center gap-3">
        {vendor.instagram_url && (
          <a
            href={vendor.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Link2 size={13} />
            Instagram
            <ExternalLink size={11} />
          </a>
        )}
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <Phone size={13} />
            {vendor.phone}
          </a>
        )}
      </div>

      {vendor.notes && (
        <p className="text-xs text-[var(--color-text-muted)] border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
          {vendor.notes}
        </p>
      )}

      {confirming && (
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 rounded-b-[var(--radius-md)] bg-red-50 border-t"
          style={{ borderColor: 'var(--color-destructive)' }}
        >
          <p className="text-sm text-[var(--color-destructive)]">Remove this vendor?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="text-xs px-2 py-0.5 rounded-[var(--radius-sm)] border text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(vendor.id)}
              className="text-xs px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-destructive)] text-white"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

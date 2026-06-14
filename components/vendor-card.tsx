import type { Vendor } from '@/types'
import { cn } from '@/lib/utils'
import { Link2, Phone, ExternalLink } from 'lucide-react'

const STATUS_STYLE = {
  shortlisted: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
  contacted: 'bg-blue-50 text-[var(--color-info)]',
  booked: 'bg-green-50 text-[var(--color-ok)]',
}

interface VendorCardProps {
  vendor: Vendor
  eventName?: string
  onStatusChange: (id: string, status: Vendor['status']) => void
}

const STATUS_CYCLE: Record<string, Vendor['status']> = {
  shortlisted: 'contacted',
  contacted: 'booked',
  booked: 'shortlisted',
}

export function VendorCard({ vendor, eventName, onStatusChange }: VendorCardProps) {
  return (
    <div
      className="p-4 border rounded-[var(--radius-md)] flex flex-col gap-3"
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
        <button
          onClick={() => onStatusChange(vendor.id, STATUS_CYCLE[vendor.status])}
          className={cn(
            'text-xs px-2 py-0.5 rounded-full shrink-0 transition-opacity hover:opacity-80',
            STATUS_STYLE[vendor.status]
          )}
        >
          {vendor.status}
        </button>
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
    </div>
  )
}

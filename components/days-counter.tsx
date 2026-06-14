import { differenceInDays } from 'date-fns'

const SHAADI_DATE = new Date('2026-12-20')

export function DaysCounter() {
  const days = differenceInDays(SHAADI_DATE, new Date())

  return (
    <div className="flex items-baseline gap-3">
      <span
        className="text-7xl font-medium leading-none"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-accent)' }}
      >
        {days}
      </span>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">days</p>
        <p className="text-xs text-[var(--color-text-secondary)]">until Shaadi</p>
      </div>
    </div>
  )
}

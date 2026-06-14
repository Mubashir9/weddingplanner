import type { Nudge } from '@/types'

interface NudgePanelProps {
  nudges: Nudge[]
}

const COLOR: Record<string, string> = {
  warning: 'var(--color-warning)',
  ok: 'var(--color-ok)',
  info: 'var(--color-info)',
}

export function NudgePanel({ nudges }: NudgePanelProps) {
  if (!nudges.length) {
    return (
      <div className="text-sm text-[var(--color-text-muted)]">
        No nudges yet — AI will analyse your plan shortly.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {nudges.map((nudge, i) => (
        <div
          key={i}
          className="flex items-start gap-3 pl-3 border-l-2 py-0.5"
          style={{ borderLeftColor: COLOR[nudge.type] ?? COLOR.info }}
        >
          <span
            className="mt-1.5 size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: COLOR[nudge.type] ?? COLOR.info }}
          />
          <p className="text-sm text-[var(--color-text-primary)]">{nudge.text}</p>
        </div>
      ))}
    </div>
  )
}

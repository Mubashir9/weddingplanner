'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
  in_progress: 'bg-blue-50 text-[var(--color-info)]',
  done: 'bg-green-50 text-[var(--color-ok)]',
}

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, status: TaskStatus) => void
}

export function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [status, setStatus] = useState<TaskStatus>(task.status as TaskStatus)
  const [loading, setLoading] = useState(false)

  async function cycleStatus() {
    if (loading) return
    const next = STATUS_CYCLE[status]
    setStatus(next)
    setLoading(true)
    const supabase = createClient()
    await supabase.from('tasks').update({ status: next }).eq('id', task.id)
    onUpdate(task.id, next)
    setLoading(false)
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm',
            status === 'done'
              ? 'line-through text-[var(--color-text-muted)]'
              : 'text-[var(--color-text-primary)]'
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {task.category && (
            <span className="text-xs text-[var(--color-text-muted)]">{task.category}</span>
          )}
          {task.due_date && (
            <span className="text-xs text-[var(--color-text-muted)]">
              Due {new Date(task.due_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={cycleStatus}
        disabled={loading}
        className={cn(
          'text-xs px-2 py-0.5 rounded-full shrink-0 ml-3 transition-opacity',
          STATUS_STYLE[status],
          loading && 'opacity-50'
        )}
      >
        {STATUS_LABEL[status]}
      </button>
    </div>
  )
}

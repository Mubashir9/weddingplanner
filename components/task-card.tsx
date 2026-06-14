'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

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
  onDelete: (id: string) => void
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [status, setStatus] = useState<TaskStatus>(task.status as TaskStatus)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function cycleStatus() {
    if (loading || confirming) return
    const next = STATUS_CYCLE[status]
    setStatus(next)
    setLoading(true)
    const supabase = createClient()
    await supabase.from('tasks').update({ status: next }).eq('id', task.id)
    onUpdate(task.id, next)
    setLoading(false)
  }

  if (confirming) {
    return (
      <div
        className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 bg-red-50"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p className="text-sm text-[var(--color-destructive)]">Delete this task?</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="text-xs px-2 py-0.5 rounded-[var(--radius-sm)] border text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-destructive)] text-white"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group flex items-center justify-between px-4 py-3 border-b last:border-b-0"
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
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.assigned_to && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-accent)', backgroundColor: 'var(--color-surface)' }}
            >
              {task.assigned_to}
            </span>
          )}
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
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <button
          onClick={cycleStatus}
          disabled={loading}
          className={cn(
            'text-xs px-2 py-0.5 rounded-full transition-opacity',
            STATUS_STYLE[status],
            loading && 'opacity-50'
          )}
        >
          {STATUS_LABEL[status]}
        </button>
        <button
          onClick={() => setConfirming(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-destructive)]"
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

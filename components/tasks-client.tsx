'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TaskCard } from '@/components/task-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Task, TaskStatus, Event, TaskCategory } from '@/types'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'

interface TasksClientProps {
  events: Event[]
  initialTasks: Task[]
  weddingId: string
}

export function TasksClient({ events, initialTasks, weddingId }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(events.map((e) => [e.id, true]))
  )
  const [adding, setAdding] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('other')
  const [isPending, startTransition] = useTransition()

  function handleUpdate(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  async function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
  }

  async function handleAddTask(eventId: string) {
    if (!newTitle.trim()) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        event_id: eventId,
        wedding_id: weddingId,
        title: newTitle.trim(),
        category: newCategory,
        status: 'todo',
      })
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) => [...prev, data as Task])
    }
    setNewTitle('')
    setAdding(null)
  }

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const eventTasks = tasks.filter((t) => t.event_id === event.id)
        const isOpen = expanded[event.id]
        const done = eventTasks.filter((t) => t.status === 'done').length

        return (
          <section key={event.id}>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [event.id]: !prev[event.id] }))
                }
                className="flex items-center gap-2 text-left"
              >
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <h2
                  className="text-xl font-medium"
                  style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
                >
                  {event.name}
                </h2>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {done}/{eventTasks.length}
                </span>
              </button>
              <button
                onClick={() => setAdding(event.id)}
                className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
              >
                <Plus size={13} />
                Add task
              </button>
            </div>

            {isOpen && (
              <div
                className="border rounded-[var(--radius-md)] overflow-hidden"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              >
                {eventTasks.length === 0 && adding !== event.id ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No tasks for {event.name} yet.
                    </p>
                    <button
                      onClick={() => setAdding(event.id)}
                      className="mt-2 text-sm text-[var(--color-accent)] hover:underline"
                    >
                      Add first task
                    </button>
                  </div>
                ) : (
                  eventTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))
                )}

                {adding === event.id && (
                  <div
                    className="flex gap-2 p-3 border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Task title…"
                      className="flex-1 text-sm h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(event.id)
                        if (e.key === 'Escape') setAdding(null)
                      }}
                      autoFocus
                    />
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                      className="text-sm h-8 px-2 border rounded-[var(--radius-sm)] bg-[var(--color-bg)] text-[var(--color-text-primary)]"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <option value="other">Other</option>
                      <option value="attire">Attire</option>
                      <option value="catering">Catering</option>
                      <option value="decor">Decor</option>
                      <option value="planning">Planning</option>
                    </select>
                    <Button
                      size="sm"
                      onClick={() => handleAddTask(event.id)}
                      className="h-8 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)]"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdding(null)}
                      className="h-8 rounded-[var(--radius-sm)]"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

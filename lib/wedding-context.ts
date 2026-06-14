import { differenceInDays } from 'date-fns'
import type { WeddingContext, Event, Task, Vendor, BudgetItem } from '@/types'

export function buildWeddingContext(
  events: Event[],
  tasks: Task[],
  vendors: Vendor[],
  budgetItems: BudgetItem[]
): WeddingContext {
  const shadaaiEvent = events.find((e) => e.name === 'Shaadi')
  const weddingDate = shadaaiEvent?.event_date ?? '2026-12-20'
  const daysRemaining = differenceInDays(new Date(weddingDate), new Date())

  const eventsSummary = events.map((event) => {
    const eventTasks = tasks.filter((t) => t.event_id === event.id)
    return {
      name: event.name,
      date: event.event_date,
      venue: event.venue,
      tasksSummary: {
        total: eventTasks.length,
        done: eventTasks.filter((t) => t.status === 'done').length,
        todo: eventTasks.filter((t) => t.status === 'todo').length,
      },
    }
  })

  const vendorsSummary = vendors.map((v) => ({
    name: v.name,
    category: v.category,
    event: events.find((e) => e.id === v.event_id)?.name ?? null,
    status: v.status,
  }))

  const totalSpent = budgetItems.reduce((sum, item) => sum + Number(item.amount), 0)
  const byEvent: Record<string, number> = {}
  for (const event of events) {
    byEvent[event.name] = budgetItems
      .filter((b) => b.event_id === event.id)
      .reduce((sum, b) => sum + Number(b.amount), 0)
  }

  const pendingTasks = tasks
    .filter((t) => t.status !== 'done')
    .slice(0, 10)
    .map((t) => ({
      title: t.title,
      event: events.find((e) => e.id === t.event_id)?.name ?? 'General',
      status: t.status,
    }))

  return {
    weddingDate,
    daysRemaining,
    events: eventsSummary,
    vendors: vendorsSummary,
    budget: {
      totalSet: 0,
      totalSpent,
      byEvent,
    },
    pendingTasks,
  }
}

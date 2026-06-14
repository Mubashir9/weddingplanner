export type EventName = 'Nikkah' | 'Shaadi' | 'Valima'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskCategory = 'attire' | 'catering' | 'decor' | 'planning' | 'other'
export type VendorStatus = 'shortlisted' | 'contacted' | 'booked'
export type VendorCategory =
  | 'catering'
  | 'photography'
  | 'mehendi'
  | 'attire_bride'
  | 'attire_groom'
  | 'decor'
  | 'band_dhol'
  | 'makeup'
  | 'transport'
  | 'other'
export type BudgetCategory = 'catering' | 'attire' | 'decor' | 'photography' | 'misc'
export type NudgeType = 'warning' | 'ok' | 'info'

export interface Wedding {
  id: string
  name: string
  created_at: string
}

export interface WeddingMember {
  id: string
  wedding_id: string
  user_id: string
  role: 'owner' | 'editor'
}

export interface Event {
  id: string
  wedding_id: string
  name: EventName
  event_date: string
  venue: string | null
  notes: string | null
}

export interface Task {
  id: string
  event_id: string
  wedding_id: string
  title: string
  status: TaskStatus
  assigned_to: string | null
  due_date: string | null
  category: TaskCategory | null
}

export interface BudgetItem {
  id: string
  wedding_id: string
  event_id: string | null
  vendor_id: string | null
  label: string
  amount: number
  currency: string
  category: BudgetCategory | null
  paid: boolean
  created_at: string
}

export interface Vendor {
  id: string
  wedding_id: string
  event_id: string | null
  name: string
  category: VendorCategory | null
  instagram_url: string | null
  phone: string | null
  quote: number | null
  status: VendorStatus
  notes: string | null
  created_at: string
}

export interface Nudge {
  text: string
  type: NudgeType
}

export interface AiNudge {
  id: string
  wedding_id: string
  nudges: Nudge[]
  generated_at: string
}

export interface WeddingContext {
  weddingDate: string
  daysRemaining: number
  events: Array<{
    name: string
    date: string
    venue: string | null
    tasksSummary: { total: number; done: number; todo: number }
  }>
  vendors: Array<{
    name: string
    category: string | null
    event: string | null
    status: string
  }>
  budget: {
    totalSet: number
    totalSpent: number
    byEvent: Record<string, number>
  }
  pendingTasks: Array<{
    title: string
    event: string
    status: string
  }>
}

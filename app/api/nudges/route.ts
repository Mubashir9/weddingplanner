import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildWeddingContext } from '@/lib/wedding-context'
import { geminiModel, buildNudgePrompt } from '@/lib/gemini'
import type { Event, Task, Vendor, BudgetItem } from '@/types'

const CACHE_HOURS = 6

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: member } = await supabase
    .from('wedding_members')
    .select('wedding_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'No wedding found' }, { status: 404 })
  }

  const weddingId = member.wedding_id
  const refresh = request.nextUrl.searchParams.get('refresh') === '1'

  // Check cache
  if (!refresh) {
    const { data: cached } = await supabase
      .from('ai_nudges')
      .select('nudges, generated_at')
      .eq('wedding_id', weddingId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      if (age < CACHE_HOURS * 60 * 60 * 1000) {
        return NextResponse.json({ nudges: cached.nudges })
      }
    }
  }

  // Fetch wedding data
  const [
    { data: events },
    { data: tasks },
    { data: vendors },
    { data: budgetItems },
  ] = await Promise.all([
    supabase.from('events').select('*').eq('wedding_id', weddingId),
    supabase.from('tasks').select('*').eq('wedding_id', weddingId),
    supabase.from('vendors').select('*').eq('wedding_id', weddingId),
    supabase.from('budget_items').select('*').eq('wedding_id', weddingId),
  ])

  const context = buildWeddingContext(
    (events ?? []) as Event[],
    (tasks ?? []) as Task[],
    (vendors ?? []) as Vendor[],
    (budgetItems ?? []) as BudgetItem[]
  )

  const prompt = buildNudgePrompt(context)

  try {
    const result = await geminiModel.generateContent(prompt)
    const text = result.response.text().trim()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Invalid response format')

    const nudges = JSON.parse(jsonMatch[0])

    // Cache
    await supabase.from('ai_nudges').insert({
      wedding_id: weddingId,
      nudges,
    })

    return NextResponse.json({ nudges })
  } catch (err) {
    console.error('Nudge generation error:', err)
    return NextResponse.json(
      { nudges: [{ text: 'Could not generate nudges. Check back soon.', type: 'info' }] },
      { status: 200 }
    )
  }
}

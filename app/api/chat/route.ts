import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildWeddingContext } from '@/lib/wedding-context'
import { geminiModel, buildChatSystemPrompt } from '@/lib/gemini'
import type { Event, Task, Vendor, BudgetItem } from '@/types'

export async function POST(request: NextRequest) {
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
  const body = await request.json()
  const messages: Array<{ role: string; content: string }> = body.messages ?? []
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()

  if (!lastUserMessage) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

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

  const systemPrompt = buildChatSystemPrompt(context)

  // Build conversation history for Gemini
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const chat = geminiModel.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I'm ready to help with your wedding planning." }] },
      ...history,
    ],
  })

  try {
    const result = await chat.sendMessageStream(lastUserMessage.content)

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            // Vercel AI SDK format
            controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      },
    })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}

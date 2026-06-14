'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Failed to get response')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Parse Vercel AI SDK data stream format: 0:"text"
        const lines = chunk.split('\n').filter(Boolean)
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2))
              accumulated += text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              )
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again." }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p
              className="text-2xl font-medium mb-2"
              style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
            >
              Ask anything about your wedding
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              I know your events, tasks, vendors and budget.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[75%] rounded-[var(--radius-md)] px-4 py-3 text-sm',
                m.role === 'user'
                  ? 'text-white'
                  : 'border text-[var(--color-text-primary)]'
              )}
              style={
                m.role === 'user'
                  ? { backgroundColor: 'var(--color-accent)' }
                  : { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }
              }
            >
              {m.content ? (
                <p className="whitespace-pre-wrap">{m.content}</p>
              ) : (
                <span className="animate-pulse text-[var(--color-text-muted)]">Thinking…</span>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about tasks, vendors, budget, timeline…"
          rows={2}
          className="flex-1 resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as FormEvent)
            }
          }}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="self-end h-9 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)]"
        >
          <Send size={15} />
        </Button>
      </form>
    </div>
  )
}

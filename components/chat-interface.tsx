'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Info, X, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const CAN_DO = [
  'See your tasks, vendors, budget and events — always live from the database',
  'Summarise spend, what\'s paid vs. unpaid, and gaps in your vendor list',
  'Count days remaining to Nikkah, Shaadi, and Valima',
  'Advise on priorities based on your actual task list',
  'Answer Pakistani wedding culture questions (Barat, Mehndi, Dholki, attire, etc.)',
  'Remember everything said in the current session',
]

const CANNOT_DO = [
  'Browse the internet or look up vendors, reviews, or prices',
  'Create tasks, add vendors, or change your budget — read-only',
  'Remember conversations after you close or refresh the page',
  'Answer questions unrelated to your wedding',
  'Provide real-time market pricing — only what you\'ve entered',
  'Handle very long sessions (context window limit applies)',
]

function InfoDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-10 right-0 z-50 w-80 sm:w-96 border rounded-[var(--radius-md)] shadow-lg overflow-hidden"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">What the AI can & can't do</p>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ok)] mb-1.5">Can do</p>
          <ul className="space-y-1">
            {CAN_DO.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check size={11} className="text-[var(--color-ok)] mt-0.5 shrink-0" />
                <span className="text-xs text-[var(--color-text-secondary)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-destructive)] mb-1.5">Cannot do</p>
          <ul className="space-y-1">
            {CANNOT_DO.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <AlertCircle size={11} className="text-[var(--color-destructive)] mt-0.5 shrink-0" />
                <span className="text-xs text-[var(--color-text-secondary)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] border-t pt-2" style={{ borderColor: 'var(--color-border)' }}>
          Data is fetched fresh from your database on every message.
        </p>
      </div>
    </div>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close info popup on outside click
  useEffect(() => {
    if (!showInfo) return
    function handleClick(e: MouseEvent) {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showInfo])

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
      {/* Info button — top-right */}
      <div className="relative flex justify-end mb-2" ref={infoRef}>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
            showInfo
              ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          )}
          style={{ borderColor: showInfo ? 'var(--color-accent)' : undefined }}
        >
          <Info size={12} />
          What can this do?
        </button>
        {showInfo && <InfoDialog onClose={() => setShowInfo(false)} />}
      </div>

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

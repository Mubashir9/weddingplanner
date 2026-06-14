import { ChatInterface } from '@/components/chat-interface'

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <h1
        className="text-3xl font-medium"
        style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-text-primary)' }}
      >
        AI Chat
      </h1>
      <ChatInterface />
    </div>
  )
}

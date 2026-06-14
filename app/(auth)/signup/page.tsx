'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1
            className="text-4xl font-medium mb-1"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Wedding Planner
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min. 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-destructive)]">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white rounded-[var(--radius-sm)]"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[var(--color-accent)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

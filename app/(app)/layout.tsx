import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar, BottomNav } from '@/components/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="mx-auto max-w-[1100px] px-6 py-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to Content Catcher</h1>
        <p className="text-xl mb-8">Your personal content management assistant</p>
        <div className="flex gap-4">
          <a href="/login" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-lg text-lg">
            Get Started
          </a>
        </div>
      </div>
    </main>
  )
}

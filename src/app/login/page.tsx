"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, signup } from './actions'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData, action: 'login' | 'signup') {
    setLoading(true)
    setError(null)

    try {
      const result = await (action === 'login' ? login(formData) : signup(formData))
      
      if ('error' in result) {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-primary text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account or create a new one
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="text-primary block text-sm font-medium"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border-input bg-background focus:ring-primary/20 mt-1 block w-full rounded-lg border px-4 py-2 transition-all focus:ring-2 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-primary block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="border-input bg-background focus:ring-primary/20 mt-1 block w-full rounded-lg border px-4 py-2 transition-all focus:ring-2 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4">
            <button
              formAction={(formData) => handleSubmit(formData, 'login')}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 flex-1 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
            <button
              formAction={(formData) => handleSubmit(formData, 'signup')}
              disabled={loading}
              className="text-primary hover:bg-primary/5 flex-1 rounded-lg border px-4 py-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

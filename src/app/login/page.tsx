"use client";

import { useState, useOptimistic } from 'react'
import { login } from './actions'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [optimisticIsLoading, setOptimisticIsLoading] = useOptimistic(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOptimisticIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await login(email, password)
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setOptimisticIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border-gray-200 bg-white focus:ring-gray-200 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="border-gray-200 bg-white focus:ring-gray-200 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={optimisticIsLoading}
            className="bg-gray-900 hover:bg-gray-800 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white disabled:opacity-50"
          >
            {optimisticIsLoading ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>

          <div className="text-center">
            <a href="/signup" className="text-gray-700 hover:text-gray-900 inline-flex items-center gap-2">
              Don&apos;t have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

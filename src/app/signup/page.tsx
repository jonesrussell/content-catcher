"use client";

import { useState, useOptimistic } from "react";
import { signup } from "./actions";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [optimisticIsLoading, setOptimisticIsLoading] = useOptimistic(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOptimisticIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await signup(email, password);
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setOptimisticIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create an Account
          </h1>
          <p className="mt-2 text-gray-600">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:ring-2 focus:ring-gray-200 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:ring-2 focus:ring-gray-200 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={optimisticIsLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {optimisticIsLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              "Sign up"
            )}
          </button>

          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

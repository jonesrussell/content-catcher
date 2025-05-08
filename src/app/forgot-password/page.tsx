"use client";

import { useState } from "react";
import { resetPassword } from "./actions";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-gray-600">
            Enter your email to reset your password
          </p>
        </div>

        {success ? (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
            Check your email for a password reset link
          </div>
        ) : (
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
                className="border-input bg-background focus:ring-primary/20 w-full rounded-lg border px-4 py-3 focus:ring-2 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center">
              <a
                href="/login"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-2"
              >
                Back to Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

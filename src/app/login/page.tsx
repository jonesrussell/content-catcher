"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { toast } from "react-hot-toast";
import { LogIn, AlertCircle } from "lucide-react";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="text-gray-900 text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-700 mt-2">Login to your account</p>
        </div>
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-700 mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border-gray-200 bg-white focus:ring-gray-200 w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              required
              autoComplete="email"
              name="email"
            />
          </div>
          <div>
            <label className="text-gray-700 mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border-gray-200 bg-white focus:ring-gray-200 w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              required
              autoComplete="current-password"
              name="password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              "Logging in..."
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Login!
              </>
            )}
          </button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Forgot Password?
            </Link>
            <Link
              href="/signup"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { toast } from "react-hot-toast";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.message.includes("email_not_confirmed")) {
          toast.success("Please check your email to confirm your account");
          router.push("/login");
        } else {
          throw error;
        }
      } else {
        toast.success(
          "Account created successfully! Please check your email to confirm your account",
        );
        router.push("/login");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to create account");
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
          <h1 className="text-gray-900 text-3xl font-bold">Create Account</h1>
          <p className="text-gray-700 mt-2">Sign up to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-gray-700 mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-200 bg-white focus:ring-gray-200 w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none"
              required
              autoComplete="new-password"
              name="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white transition-colors disabled:opacity-50"
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create Account
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-gray-700 hover:text-gray-900 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

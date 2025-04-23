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
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      await signIn(email, password);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Create Account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
              autoComplete="username"
              name="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
              autoComplete="new-password"
              name="password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

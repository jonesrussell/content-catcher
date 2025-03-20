"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User } from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            Collector
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-primary/80 hover:text-primary transition-colors"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

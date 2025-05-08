"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/login/actions";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLink = ({
    href,
    children,
    className = "",
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <Link
      href={href}
      className={`text-gray-700 hover:text-gray-900 transition-colors ${className}`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-primary text-xl font-bold">
            Stash
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/profile">Profile</NavLink>
            <form action={signOut}>
              <button
                type="submit"
                className="text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>

          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-gray-900 md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-gray-200 border-t py-4 md:hidden"
            >
              <div className="flex flex-col gap-4">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/profile">Profile</NavLink>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, signOut } = useAuth();
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
    <header className="border-gray-200 fixed top-0 right-0 left-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-gray-900 hover:text-gray-700 text-lg font-bold transition-colors md:text-2xl"
          >
            Stash
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {user ? (
              <>
                <NavLink href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </NavLink>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <NavLink href="/signup">Sign Up</NavLink>
                <Link
                  href="/login"
                  className="bg-gray-900 hover:bg-gray-800 rounded-lg px-4 py-2 text-white transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="text-gray-700 hover:text-gray-900 p-2 transition-colors md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-gray-200 border-t py-4 md:hidden"
            >
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <NavLink
                      href="/profile"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink href="/signup">Sign Up</NavLink>
                    <Link
                      href="/login"
                      className="bg-gray-900 hover:bg-gray-800 rounded-lg px-4 py-2 text-center text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

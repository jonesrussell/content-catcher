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

  const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link 
      href={href} 
      className={`text-primary/80 hover:text-primary transition-colors ${className}`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-lg md:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
            Collector
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/">Home</NavLink>
            {user ? (
              <>
                <NavLink href="/profile" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </NavLink>
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary hover:text-primary/80 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-primary/10"
            >
              <div className="flex flex-col gap-4">
                <NavLink href="/">Home</NavLink>
                {user ? (
                  <>
                    <NavLink href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-primary/80 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

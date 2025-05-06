"use client";

import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AnimatedHome() {
  useEffect(() => {
    console.log("AnimatedHome mounted");
  }, []);

  console.log("AnimatedHome rendering");

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-6">Stash</h1>
        <p className="text-xl text-gray-600">
          A minimalist, effortless way to store and retrieve anything important
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/80 p-8 rounded-2xl shadow-xl backdrop-blur-sm mb-12"
      >
        <div className="h-32 bg-gray-100 rounded-lg mb-4 animate-pulse" />
        <div className="h-48 bg-gray-50 rounded-lg animate-pulse" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex justify-center"
      >
        <Link
          href="/login"
          className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2 rounded-lg px-8 py-4 text-lg text-white transition-colors"
        >
          <LogIn className="h-5 w-5" />
          Get Started
        </Link>
      </motion.div>
    </div>
  );
} 
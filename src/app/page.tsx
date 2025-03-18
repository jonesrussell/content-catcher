"use client";

import ContentEditor from "@/components/ContentEditor";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="bottom-right" />
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary mb-4">
            Content Collector
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Capture your thoughts, ideas, and content in one place. Just start
            typing or paste your content below.
          </p>
        </motion.div>
        <ContentEditor />
      </div>
    </main>
  );
}

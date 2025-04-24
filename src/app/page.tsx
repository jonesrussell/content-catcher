"use client";

import ContentEditor from "@/components/ContentEditor";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { SavedContentSection } from "@/components/SavedContent/SavedContentSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="bottom-right" />
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-10 md:mb-12"
        >
          <h1 className="text-primary mb-3 text-3xl font-bold sm:text-4xl md:text-5xl">
            Content Collector
          </h1>
          <p className="text-muted-foreground mx-auto text-base sm:text-lg md:max-w-2xl">
            Capture your thoughts, ideas, and content in one place. Just start
            typing or paste your content below.
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl">
          <ContentEditor />
          <SavedContentSection />
        </div>
      </div>
    </main>
  );
}

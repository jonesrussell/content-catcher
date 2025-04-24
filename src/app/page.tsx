"use client";

import ContentEditor from "@/components/ContentEditor";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { SavedContentSection } from "@/components/SavedContent/SavedContentSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="bottom-right" />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-primary mb-4 text-4xl font-bold">
            Content Collector
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Capture your thoughts, ideas, and content in one place. Just start
            typing or paste your content below.
          </p>
        </motion.div>
        <ContentEditor />

        <SavedContentSection />
      </div>
    </main>
  );
}

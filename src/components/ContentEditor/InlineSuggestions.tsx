"use client";

import { motion } from "framer-motion";
import type { AISuggestion } from "@/hooks/useAISuggestions";

interface InlineSuggestionsProps {
  suggestions: AISuggestion[];
  loading: boolean;
  onApply: (content: string) => void;
}

export function InlineSuggestions({
  suggestions,
  loading,
  onApply
}: InlineSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 backdrop-blur-sm 
        rounded-xl border border-primary/10 overflow-hidden p-4"
    >
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-primary/60">
            <div className="w-4 h-4 border-2 border-primary/20 border-t-primary/60 rounded-full animate-spin" />
            Analyzing content...
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-4 py-2 bg-white/90 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all cursor-pointer flex items-center gap-3"
              onClick={() => {
                if (!suggestion.improvedContent) return;
                onApply(suggestion.improvedContent);
              }}
            >
              <span className={`w-2 h-2 rounded-full ${
                suggestion.type === 'structure' ? 'bg-blue-500' :
                suggestion.type === 'enhancement' ? 'bg-green-500' :
                suggestion.type === 'tone' ? 'bg-yellow-500' :
                suggestion.type === 'engagement' ? 'bg-pink-500' :
                'bg-purple-500'
              }`} />
              <p className="text-sm text-primary/80 truncate">
                {suggestion.suggestion}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

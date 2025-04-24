"use client";

import { motion } from "framer-motion";
import { useAISuggestions } from "@/hooks/useAISuggestions";

interface AIFeaturesProps {
  content: string;
  onApplySuggestion?: (content: string) => void;
  disabled?: boolean;
}

export function AIFeatures({ content, onApplySuggestion, disabled = false }: AIFeaturesProps) {
  const {
    suggestions: aiSuggestions,
    loading: aiSuggestionsLoading
  } = useAISuggestions(content);

  if (content.length < 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* AI Features content */}
      {aiSuggestionsLoading && (
        <div className="text-center text-primary/40">Loading AI suggestions...</div>
      )}
      {!aiSuggestionsLoading && aiSuggestions.length > 0 && (
        <div className="space-y-2">
          {aiSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onApplySuggestion?.(suggestion.suggestion)}
              disabled={disabled}
              className="w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              {suggestion.suggestion}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

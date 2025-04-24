"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { TagInput } from "@/components/TagInput";
import { SuggestionsPanel } from "./SuggestionsPanel";

interface AIFeaturesSectionProps {
  content: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: {
    totalTags: number;
    categoryCounts: Record<string, number>;
    accuracyScore: number;
    languageBreakdown: Record<string, number>;
    topCooccurrences: [string, string, number][];
  };
  language: string;
  suggestions: AISuggestion[];
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  disabled?: boolean;
}

export function AIFeaturesSection({
  content,
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
  tagStats,
  language,
  suggestions,
  onApplySuggestion,
  textareaRef,
  disabled = false
}: AIFeaturesSectionProps) {
  const {
    suggestions: aiSuggestions,
    loading: aiSuggestionsLoading,
    setSuggestions: setAISuggestions
  } = useAISuggestions(content);

  const {
    suggestions: initialTagSuggestions,
    stats: initialTagStats,
    loading: initialTagSuggestionsLoading,
    language: initialLanguage
  } = useAdvancedTagging(content);

  const [currentTagSuggestions, setCurrentTagSuggestions] = useState<typeof initialTagSuggestions>(initialTagSuggestions);
  const [currentTagStats, setCurrentTagStats] = useState<typeof initialTagStats>(initialTagStats);
  const [currentLanguage, setCurrentLanguage] = useState<typeof initialLanguage>(initialLanguage);

  useEffect(() => {
    setCurrentTagSuggestions(initialTagSuggestions);
    setCurrentTagStats(initialTagStats);
    setCurrentLanguage(initialLanguage);
  }, [initialTagSuggestions, initialTagStats, initialLanguage]);

  if (content.length < 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col md:grid md:grid-cols-2 gap-6"
    >
      <div className="space-y-6">
        {/* Tags Section */}
        <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border-2 border-primary/5 shadow-sm">
          <h3 className="text-lg font-semibold text-primary/40 mb-4">Tags</h3>
          {content.length >= 100 ? (
            <TagInput
              tags={tags}
              setTags={setTags}
              tagSuggestions={tagSuggestions}
              tagSuggestionsLoading={tagSuggestionsLoading}
              tagStats={tagStats}
              language={language}
              onUpdateSuggestions={setCurrentTagSuggestions}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/5 rounded-full text-primary/30 text-sm">Tag placeholder</span>
              <span className="px-3 py-1 bg-primary/5 rounded-full text-primary/30 text-sm">Another tag</span>
            </div>
          )}
        </div>

        {/* AI Suggestions Section */}
        <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border-2 border-primary/5 shadow-sm">
          <h3 className="text-lg font-semibold text-primary/40 mb-4">AI Suggestions</h3>
          {content.length >= 100 && suggestions.length > 0 ? (
            <SuggestionsPanel
              suggestions={suggestions}
              onApplySuggestion={onApplySuggestion}
              textareaRef={textareaRef}
            />
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-2/3 h-4 bg-primary/5 rounded-full mb-2"></div>
                <div className="w-1/2 h-3 bg-primary/5 rounded-full"></div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <div className="w-3/4 h-4 bg-primary/5 rounded-full mb-2"></div>
                <div className="w-1/3 h-3 bg-primary/5 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

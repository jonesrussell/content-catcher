"use client";

import { motion } from "framer-motion";
import { TitleSection } from "./TitleSection";
import { TagInput } from "@/components/TagInput";
import { InlineSuggestions } from "./InlineSuggestions";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { useTagSuggestionsManager } from "@/hooks/useTagSuggestionsManager";

interface AIFeaturesProps {
  content: string;
  title: string;
  setTitle: (title: string) => void;
  isGeneratingTitle: boolean;
  setIsGeneratingTitle: (loading: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagStats: any;
  language: string;
  suggestions: AISuggestion[];
  tagSuggestionsLoading: boolean;
  suggestionsLoading: boolean;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  onApplySuggestion: (content: string) => void;
  setTagSuggestions?: (suggestions: TagAnalysis[]) => void;
  disabled?: boolean;
}

export function AIFeatures({
  content,
  title,
  setTitle,
  isGeneratingTitle,
  setIsGeneratingTitle,
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
  tagStats,
  language,
  suggestions,
  suggestionsLoading,
  setSuggestions,
  onApplySuggestion,
  setTagSuggestions,
  disabled
}: AIFeaturesProps) {
  if (content.length < 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >

      {/* AI Features handled by AIFeaturesSection */}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { TitleSection } from "./TitleSection";
import { TagInput } from "@/components/TagInput";
import { InlineSuggestions } from "./InlineSuggestions";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { useTagSuggestionsManager } from "@/hooks/useTagSuggestionsManager";
import { useState, useEffect } from "react";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { toast } from "react-hot-toast";

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
  onApplySuggestion?: (content: string) => void;
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
  disabled = false
}: AIFeaturesProps) {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* AI Features content */}
    </motion.div>
  );
}

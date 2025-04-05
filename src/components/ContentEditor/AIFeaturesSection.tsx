"use client";

import { motion } from "framer-motion";
import { AIFeatures } from "./AIFeatures";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { TagInput } from "@/components/TagInput";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import type { AISuggestion } from "@/hooks/useAISuggestions";

interface AIFeaturesSectionProps {
  content: string;
  title: string;
  setTitle: (title: string) => void;
  isGeneratingTitle: boolean;
  setIsGeneratingTitle: (loading: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: any;
  language: string;
  suggestions: AISuggestion[];
  suggestionsLoading: boolean;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  setTagSuggestions: (suggestions: TagAnalysis[]) => void;
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
}

export function AIFeaturesSection({
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
  setTagSuggestions,
  onApplySuggestion,
  textareaRef,
  disabled
}: AIFeaturesSectionProps) {
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
              onUpdateSuggestions={setTagSuggestions}
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

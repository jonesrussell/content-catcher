"use client";

import { motion } from "framer-motion";
import type { TagAnalysis, TagStats } from "@/hooks/useAdvancedTagging";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { TagInput } from "@/components/TagInput";
import { SuggestionsPanel } from "./SuggestionsPanel";

interface AIFeaturesSectionProps {
  content: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: TagStats | null;
  language: string;
  suggestions: AISuggestion[];
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
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
}: AIFeaturesSectionProps) {
  if (content.length < 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 md:grid md:grid-cols-2"
    >
      <div className="space-y-6">
        {/* Tags Section */}
        <div className="border-primary/5 rounded-xl border-2 bg-white/30 p-6 shadow-sm backdrop-blur-sm">
          <h3 className="text-primary/40 mb-4 text-lg font-semibold">Tags</h3>
          {content.length >= 100 ? (
            <TagInput
              tags={tags}
              setTags={setTags}
              tagSuggestions={tagSuggestions}
              tagSuggestionsLoading={tagSuggestionsLoading}
              tagStats={tagStats}
              language={language}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary/5 text-primary/30 rounded-full px-3 py-1 text-sm">
                Tag placeholder
              </span>
              <span className="bg-primary/5 text-primary/30 rounded-full px-3 py-1 text-sm">
                Another tag
              </span>
            </div>
          )}
        </div>

        {/* AI Suggestions Section */}
        <div className="border-primary/5 rounded-xl border-2 bg-white/30 p-6 shadow-sm backdrop-blur-sm">
          <h3 className="text-primary/40 mb-4 text-lg font-semibold">
            AI Suggestions
          </h3>
          {content.length >= 100 && suggestions.length > 0 ? (
            <SuggestionsPanel
              suggestions={suggestions}
              onApplySuggestion={onApplySuggestion}
              textareaRef={textareaRef}
            />
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-white/20 p-3">
                <div className="bg-primary/5 mb-2 h-4 w-2/3 rounded-full"></div>
                <div className="bg-primary/5 h-3 w-1/2 rounded-full"></div>
              </div>
              <div className="rounded-lg bg-white/20 p-3">
                <div className="bg-primary/5 mb-2 h-4 w-3/4 rounded-full"></div>
                <div className="bg-primary/5 h-3 w-1/3 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

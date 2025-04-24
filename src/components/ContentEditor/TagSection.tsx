"use client";

import { TagInput } from "@/components/TagInput";
import type { TagAnalysis, TagStats } from "@/hooks/useAdvancedTagging";

interface TagSectionProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: TagStats | null;
  language: string;
  onUpdateSuggestions: (suggestions: TagAnalysis[]) => void;
}

export function TagSection({
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
  tagStats,
  language,
  onUpdateSuggestions
}: TagSectionProps) {
  return (
    <div className="mb-4">
      <TagInput
        tags={tags}
        setTags={setTags}
        tagSuggestions={tagSuggestions}
        tagSuggestionsLoading={tagSuggestionsLoading}
        tagStats={tagStats}
        language={language}
        onUpdateSuggestions={(suggestions) => {
          // Pass through to parent
          if (typeof onUpdateSuggestions === 'function') {
            onUpdateSuggestions(suggestions);
          }
        }}
      />
    </div>
  );
}

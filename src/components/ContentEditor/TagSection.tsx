"use client";

import { TagInput } from "@/components/TagInput";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";

interface TagSectionProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: any;
  language: string;
}

export function TagSection({
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
  tagStats,
  language
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
      />
    </div>
  );
}

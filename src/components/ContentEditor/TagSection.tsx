"use client";

import { TagInput } from "@/components/TagInput";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import { toast } from "react-hot-toast";

interface TagSectionProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  onUpdateSuggestions: (suggestions: TagAnalysis[]) => void;
}

export function TagSection({
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
  onUpdateSuggestions,
}: TagSectionProps) {
  return (
    <div className="mb-4">
      <TagInput
        tags={tags}
        setTags={setTags}
        suggestions={tagSuggestions.map(t => t.tag)}
        loading={tagSuggestionsLoading}
        onAddTag={(tag) => {
          setTags([...tags, tag]);
          onUpdateSuggestions(tagSuggestions.filter(s => s.tag !== tag));
          toast.success(`Added tag: ${tag}`);
        }}
      />
    </div>
  );
}

"use client";

import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import { TagInput } from "@/components/TagInput";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface AIFeaturesSectionProps {
  content: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
}

export function AIFeaturesSection({
  content,
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
}: AIFeaturesSectionProps) {
  // Only show if content is long enough AND we have either tags or suggestions
  if (
    content.length < 100 ||
    (tags.length === 0 && tagSuggestions.length === 0)
  )
    return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Tags Section */}
      <div className="border-primary/5 rounded-xl border-2 bg-white/30 p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-primary/40 mb-4 text-lg font-semibold">Tags</h3>
        {tagSuggestionsLoading ? (
          <div className="text-primary/60 flex items-center gap-2">
            <Loader2 className="h-4 w-4" />
            <span>Analyzing content...</span>
          </div>
        ) : (
          <TagInput
            tags={tags}
            setTags={setTags}
            suggestions={tagSuggestions.map((t) => t.tag)}
            onAddTag={(tag) => {
              setTags([...tags, tag]);
              toast.success(`Added tag: ${tag}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

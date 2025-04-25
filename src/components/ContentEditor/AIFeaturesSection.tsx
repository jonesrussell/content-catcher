"use client";

import { motion } from "framer-motion";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";
import { TagInput } from "@/components/TagInput";
import { toast } from "react-hot-toast";

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
  if (content.length < 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Tags Section */}
      <div className="border-primary/5 rounded-xl border-2 bg-white/30 p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-primary/40 mb-4 text-lg font-semibold">Tags</h3>
        {content.length >= 100 ? (
          <TagInput
            tags={tags}
            setTags={setTags}
            suggestions={tagSuggestions.map(t => t.tag)}
            loading={tagSuggestionsLoading}
            onAddTag={(tag) => {
              setTags([...tags, tag]);
              toast.success(`Added tag: ${tag}`);
            }}
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
    </motion.div>
  );
}

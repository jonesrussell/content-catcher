"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: {
    totalTags: number;
    categoryCounts: Record<string, number>;
    accuracyScore: number;
    languageBreakdown: Record<string, number>;
    topCooccurrences: Array<[string, string, number]>;
  } | null;
  language: string;
  onUpdateSuggestions?: (suggestions: TagAnalysis[]) => void;
}

export function TagInput({
  tags,
  setTags,
  tagSuggestions,
  tagSuggestionsLoading,
  tagStats,
  language,
  onUpdateSuggestions,
}: TagInputProps) {
  const [tagInput, setTagInput] = useState("");

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex min-h-[32px] flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-primary/10 text-primary flex items-center gap-2 rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              onClick={() => setTags(tags.filter((_, i) => i !== index))}
              className="hover:text-primary/70"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
              }
              setTagInput("");
            }
          }}
          placeholder="Add tags..."
          className="flex-grow border-none bg-transparent px-2 py-1 text-sm outline-none"
        />
        {tagSuggestionsLoading && (
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
        )}
      </div>

      {tagSuggestions.length > 0 && (
        <div className="space-y-4">
          {language !== "english" && (
            <div className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              Content detected in {language}
            </div>
          )}

          <div className="bg-primary/5 flex flex-wrap gap-2 rounded-lg p-2">
            {tagSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!tags.includes(suggestion.tag)) {
                    setTags([...tags, suggestion.tag]);
                    // Update the suggestions state through parent
                    if (onUpdateSuggestions) {
                      onUpdateSuggestions(
                        tagSuggestions.filter((s) => s.tag !== suggestion.tag),
                      );
                    }
                    toast.success(`Added tag: ${suggestion.tag}`);
                  }
                }}
                className={`group text-primary hover:bg-primary relative flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow-sm transition-colors hover:text-white ${
                  suggestion.category === "entity"
                    ? "border-2 border-blue-200"
                    : suggestion.category === "sentiment"
                      ? "border-2 border-purple-200"
                      : suggestion.category === "language"
                        ? "border-2 border-green-200"
                        : "border-2 border-gray-200"
                }`}
                title={suggestion.explanation}
              >
                {suggestion.tag}
                <span className="text-xs opacity-50">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
                <div className="bg-primary absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded-lg px-3 py-1 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                  {suggestion.explanation}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

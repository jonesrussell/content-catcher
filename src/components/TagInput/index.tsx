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
  onUpdateSuggestions
}: TagInputProps) {
  const [tagInput, setTagInput] = useState("");

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
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
            if (e.key === 'Enter' && tagInput.trim()) {
              e.preventDefault();
              if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
              }
              setTagInput("");
            }
          }}
          placeholder="Add tags..."
          className="px-2 py-1 bg-transparent border-none outline-none text-sm flex-grow"
        />
        {tagSuggestionsLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        )}
      </div>

      {tagSuggestions.length > 0 && (
        <div className="space-y-4">
          {language !== 'english' && (
            <div className="px-3 py-2 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
              Content detected in {language}
            </div>
          )}
          
          {tagStats && (
            <div className="p-3 bg-primary/5 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-primary">Tag Analysis</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-primary/60">Accuracy:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${tagStats.accuracyScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary/60">
                      {Math.round(tagStats.accuracyScore * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-primary/60">Total Tags:</span>
                  <span className="ml-2 font-medium">{tagStats.totalTags}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 p-2 bg-primary/5 rounded-lg">
            {tagSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!tags.includes(suggestion.tag)) {
                    setTags([...tags, suggestion.tag]);
                    // Update the suggestions state through parent
                    if (onUpdateSuggestions) {
                      onUpdateSuggestions(tagSuggestions.filter(
                        (s) => s.tag !== suggestion.tag
                      ));
                    }
                    toast.success(`Added tag: ${suggestion.tag}`);
                  }
                }}
                className={`group relative px-3 py-1 bg-white text-primary rounded-full text-sm 
                  hover:bg-primary hover:text-white transition-colors flex items-center gap-2 
                  shadow-sm ${
                    suggestion.category === 'entity' ? 'border-2 border-blue-200' :
                    suggestion.category === 'sentiment' ? 'border-2 border-purple-200' :
                    suggestion.category === 'language' ? 'border-2 border-green-200' :
                    'border-2 border-gray-200'
                  }`}
                title={suggestion.explanation}
              >
                {suggestion.tag}
                <span className="opacity-50 text-xs">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
                <div className="absolute hidden group-hover:block bottom-full left-1/2 transform 
                  -translate-x-1/2 mb-2 px-3 py-1 bg-primary text-white text-xs rounded-lg 
                  whitespace-nowrap shadow-lg">
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

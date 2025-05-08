"use client";

import type { AISuggestion } from "@/hooks/useAISuggestions";

interface InlineSuggestionsProps {
  suggestions: AISuggestion[];
  loading: boolean;
  onApply: (content: string) => void;
}

export function InlineSuggestions({
  suggestions,
  loading,
  onApply,
}: InlineSuggestionsProps) {
  return (
    <div
      className="border-primary/10 w-full overflow-hidden rounded-xl border bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-blue-50/50 p-4 backdrop-blur-sm"
    >
      <div className="space-y-3">
        {loading ? (
          <div className="text-primary/60 flex items-center gap-2 text-sm">
            <div className="border-primary/20 border-t-primary/60 h-4 w-4 rounded-full border-2" />
            Analyzing content...
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex cursor-pointer items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm hover:bg-white hover:shadow-md"
              onClick={() => {
                if (!suggestion.improvedContent) return;
                onApply(suggestion.improvedContent);
              }}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  suggestion.type === "structure"
                    ? "bg-blue-500"
                    : suggestion.type === "enhancement"
                      ? "bg-green-500"
                      : suggestion.type === "tone"
                        ? "bg-yellow-500"
                        : suggestion.type === "engagement"
                          ? "bg-pink-500"
                          : "bg-purple-500"
                }`}
              />
              <p className="text-primary/80 truncate text-sm">
                {suggestion.suggestion}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions: string[];
  loading: boolean;
  onAddTag: (tag: string) => void;
}

export function TagInput({
  tags,
  setTags,
  suggestions,
  loading,
  onAddTag,
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
                onAddTag(tagInput.trim());
              }
              setTagInput("");
            }
          }}
          placeholder="Add tags..."
          className="flex-grow border-none bg-transparent px-2 py-1 text-sm outline-none"
        />
        {loading && (
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-primary/5 flex flex-wrap gap-2 rounded-lg p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!tags.includes(suggestion)) {
                    setTags([...tags, suggestion]);
                    onAddTag(suggestion);
                    toast.success(`Added tag: ${suggestion}`);
                  }
                }}
                className={`group text-primary hover:bg-primary relative flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm shadow-sm transition-colors hover:text-white`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cleanTag, validateTag } from "@/utils/tags";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}

export function TagInput({
  tags,
  setTags,
  suggestions = [],
  onAddTag,
  onRemoveTag,
}: TagInputProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (tag: string) => {
    const cleanedTag = cleanTag(tag);
    if (validateTag(cleanedTag) && !tags.includes(cleanedTag)) {
      setTags([...tags, cleanedTag]);
      onAddTag?.(cleanedTag);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="group flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
          >
            {tag}
            <button
              onClick={() => {
                setTags(tags.filter((_, i) => i !== index));
                onRemoveTag?.(tag);
              }}
              className="text-primary/60 hover:text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Add a tag..."
          className="rounded-md border border-primary/20 bg-transparent px-3 py-1 text-sm focus:border-primary/40 focus:outline-none"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              handleAddTag(tagInput.trim());
              setTagInput("");
            }
          }}
        />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((suggestion) => !tags.includes(suggestion))
              .map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAddTag(suggestion)}
                  className="rounded-full bg-primary/5 px-3 py-1 text-sm text-primary/70 hover:bg-primary/10"
                >
                  {suggestion}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

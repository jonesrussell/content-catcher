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
            className="group bg-primary/10 text-primary flex items-center gap-1 rounded-full px-3 py-1 text-sm"
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
          className="border-primary/20 focus:border-primary/40 rounded-md border bg-transparent px-3 py-1 text-sm focus:outline-none"
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
                  className="bg-primary/5 text-primary/70 hover:bg-primary/10 rounded-full px-3 py-1 text-sm"
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

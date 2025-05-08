"use client";

import { useState, useCallback, useRef, useEffect, useMemo, useOptimistic } from "react";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import debounce from "lodash.debounce";
import { ContentEditorLayout } from "./ContentEditor/ContentEditorLayout";
import type { Content } from "@/types/content";
import { saveContent } from "@/app/actions/content";

interface ContentEditorProps {
  initialContent?: Content;
  initialTitle?: string;
  initialTags?: string[];
  onSave?: (content: string) => void;
  onContentSaved?: () => void;
  isModal?: boolean;
}

export default function ContentEditor({
  initialContent,
  initialTitle = "",
  initialTags = [],
  onSave,
  onContentSaved,
  isModal = false,
}: ContentEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent?.content || "");
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use optimistic updates for content
  const [optimisticContent, setOptimisticContent] = useOptimistic(content);

  const {
    tagSuggestions,
    tagSuggestionsLoading,
    setTagSuggestions,
  } = useAdvancedTagging(content);

  const handleSave = useCallback(async (closeAfterSave = false) => {
    if (!user) {
      toast.error("Please login to save content");
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      setOptimisticContent("Saving...");

      await saveContent(content, title, tags);
      
      toast.success("Content saved successfully!");
      
      onSave?.(content);
      onContentSaved?.();
      
      if (closeAfterSave || isModal) {
        setContent("");
        setTitle("");
        setTags([]);
        setTagSuggestions([]);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
      setOptimisticContent(content);
    }
  }, [content, title, tags, user, onSave, onContentSaved, isModal, setTagSuggestions, setOptimisticContent]);

  // Create debounced auto-save function
  const debouncedSave = useMemo(
    () => debounce(async () => {
      if (!content.trim() || !user) return;
      setIsAutoSaving(true);
      try {
        await handleSave(false);
      } finally {
        setIsAutoSaving(false);
      }
    }, 5000),
    [content, user, handleSave]
  );

  // Auto-save when content or tags change
  useEffect(() => {
    debouncedSave();
    return () => {
      debouncedSave.cancel();
    };
  }, [content, tags, debouncedSave]);

  return (
    <ContentEditorLayout
      content={optimisticContent}
      setContent={setContent}
      title={title}
      setTitle={setTitle}
      isGeneratingTitle={isGeneratingTitle}
      setIsGeneratingTitle={setIsGeneratingTitle}
      tags={tags}
      setTags={setTags}
      user={user}
      textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
      handleSave={handleSave}
      isAutoSaving={isAutoSaving}
      isSaving={isSaving}
      tagSuggestions={tagSuggestions}
      tagSuggestionsLoading={tagSuggestionsLoading}
    />
  );
}

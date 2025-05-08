"use client";

import { useState, useCallback, useRef, useEffect, useMemo, useOptimistic } from "react";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { toast } from "react-hot-toast";
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
    suggestions,
    handleTagInput,
    handleTagSelect,
  } = useAdvancedTagging(content);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const result = await saveContent({
        content: optimisticContent,
        title,
        tags,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Content saved successfully");
      onContentSaved?.();
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [optimisticContent, title, tags, onContentSaved]);

  // Create debounced auto-save function
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        handleSave();
      }, 1000),
    [handleSave]
  );

  // Auto-save when content or tags change
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  useEffect(() => {
    if (content !== optimisticContent) {
      debouncedSave();
    }
  }, [content, tags, debouncedSave, optimisticContent]);

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
      suggestions={suggestions}
      isSaving={isSaving}
      isAutoSaving={isAutoSaving}
      isModal={isModal}
      textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
      onContentChange={(newContent) => {
        setContent(newContent);
        setOptimisticContent(newContent);
      }}
      onTitleChange={setTitle}
      onTagsChange={setTags}
      onTagInput={handleTagInput}
      onTagSelect={handleTagSelect}
      onSave={handleSave}
      tagSuggestions={tagSuggestions}
      tagSuggestionsLoading={tagSuggestionsLoading}
    />
  );
}

"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import debounce from "lodash.debounce";
import { ContentEditorLayout } from "./ContentEditor/ContentEditorLayout";
import type { Content } from "@/types/content";

interface ContentEditorProps {
  initialContent?: Content;
  initialTitle?: string;
  initialTags?: string[];
  onSave?: (content: string) => void;
  onContentSaved?: () => void;
  disableAI?: boolean;
  isModal?: boolean;
  onFocus?: () => void;
}

export default function ContentEditor({
  initialContent,
  initialTitle = "",
  initialTags = [],
  onSave,
  onContentSaved,
  disableAI = false,
  isModal = false,
  onFocus,
}: ContentEditorProps) {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State management
  const [content, setContent] = useState(initialContent?.content ?? "");
  const [title, setTitle] = useState(initialContent?.title ?? "");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [tags, setTags] = useState<string[]>(initialContent?.tags ?? []);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Only update state when initial values change from outside
  const prevInitialContent = useRef(initialContent);
  const prevInitialTitle = useRef(initialTitle);
  const prevInitialTags = useRef(initialTags);

  useEffect(() => {
    if (prevInitialContent.current !== initialContent) {
      setContent(initialContent?.content ?? "");
      prevInitialContent.current = initialContent;
    }
    if (prevInitialTitle.current !== initialTitle) {
      setTitle(initialTitle);
      prevInitialTitle.current = initialTitle;
    }
    if (JSON.stringify(prevInitialTags.current) !== JSON.stringify(initialTags)) {
      setTags(initialTags);
      prevInitialTags.current = initialTags;
    }
  }, [initialContent, initialTitle, initialTags]);

  // Custom hooks
  const { suggestions, loading } = useAdvancedTagging(content, { enabled: !disableAI });

  const { tagSuggestions, tagSuggestionsLoading, setTagSuggestions } = useAdvancedTagging(content, {
    enabled: !disableAI,
    onSuggestions: (suggestions) => {
      setTagSuggestions(suggestions.map(s => s.tag));
    }
  });

  const handleTagSelect = useCallback((tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagSuggestions([]);
    }
  }, [tags, setTagSuggestions]);

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
      console.log("Starting save operation...");

      // Get the most recent content entry for this user
      const { data: existingContent, error: fetchError } = await supabase
        .from("content")
        .select("id, content, tags")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      const contentData = {
        user_id: user.id,
        content,
        title,
        tags: tags ?? [],
        ...(existingContent?.[0]?.id ? { id: existingContent[0].id } : {}),
        ...(existingContent?.[0]?.id ? {} : { 
          created_at: new Date().toISOString(),
          version_number: 1 
        })
      };

      console.log("Saving content with data:", contentData);

      const { data, error } = await supabase
        .from("content")
        .upsert(contentData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from upsert");
      }

      console.log("Content saved successfully:", data);
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
      const supabaseError = error as { code: string; message: string };
      if (supabaseError.code === "23505") {
        toast.error("This content already exists");
      } else if (supabaseError.code === "23503") {
        toast.error("User profile not found. Please try logging in again.");
      } else {
        toast.error(`Failed to save: ${supabaseError.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  }, [content, title, tags, user, onSave, onContentSaved, isModal]);

  // Create debounced auto-save function
  const debouncedSave = useMemo(
    () => debounce(async () => {
      if (!content.trim() || !user) return;

      // Get current content to compare
      const { data: existingContent } = await supabase
        .from("content")
        .select("content, tags")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Only save if content or tags have changed
      const hasChanged = !existingContent || 
        existingContent.content !== content || 
        JSON.stringify(existingContent.tags) !== JSON.stringify(tags);

      if (!hasChanged) return;

      setIsAutoSaving(true);
      try {
        await handleSave(false);
      } finally {
        setIsAutoSaving(false);
      }
    }, 5000),
    [content, tags, user, handleSave]
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
      content={content}
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
      onFocus={onFocus}
    />
  );
}

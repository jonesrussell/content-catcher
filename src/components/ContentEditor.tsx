"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import debounce from "lodash.debounce";
import { ContentEditorLayout } from "./ContentEditor/ContentEditorLayout";

interface ContentEditorProps {
  onContentSaved?: () => void;
}

export default function ContentEditor({ onContentSaved }: ContentEditorProps) {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // State management
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom hooks
  const {
    suggestions: initialTagSuggestions,
    stats: tagStats,
    loading: tagSuggestionsLoading,
    language,
  } = useAdvancedTagging(content);

  const [tagSuggestions, setTagSuggestions] = useState<
    typeof initialTagSuggestions
  >(initialTagSuggestions);

  useEffect(() => {
    setTagSuggestions(initialTagSuggestions);
  }, [initialTagSuggestions]);

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
      const { data: existingContent, error: fetchError } = await supabase
        .from("content")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      const contentData = {
        user_id: user.id,
        content,
        tags: tags ?? [],
        ...(existingContent?.[0]?.id ? { id: existingContent[0].id } : {}),
        ...(existingContent?.[0]?.id ? {} : { 
          created_at: new Date().toISOString(),
          version_number: 1 
        })
      };

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

      toast.success("Content saved successfully!");
      
      // Notify parent component that content was saved
      onContentSaved?.();
      
      if (closeAfterSave) {
        // Clear the editor
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
  }, [content, tags, user, onContentSaved]);

  // Create debounced auto-save function
  const debouncedSave = useCallback(
    () => {
      setIsAutoSaving(true);
      handleSave(false).finally(() => {
        setIsAutoSaving(false);
      });
    },
    [handleSave]
  );

  const debouncedSaveMemoized = useMemo(
    () => debounce(debouncedSave, 2000),
    [debouncedSave]
  );

  // Auto-save when content or tags change
  useEffect(() => {
    if (content.trim() && user) {
      debouncedSaveMemoized();
    }
    return () => {
      debouncedSaveMemoized.cancel();
    };
  }, [content, tags, user, debouncedSaveMemoized]);

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
      textareaRef={textareaRef}
      handleSave={handleSave}
      isAutoSaving={isAutoSaving}
      isSaving={isSaving}
      tagSuggestions={tagSuggestions}
      tagSuggestionsLoading={tagSuggestionsLoading}
      tagStats={tagStats}
      language={language}
    />
  );
}

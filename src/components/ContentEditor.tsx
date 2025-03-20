"use client";

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from "react";
import { SuggestionsPanel } from "./ContentEditor/SuggestionsPanel";
import { useContentHistory } from "@/hooks/useContentHistory";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { TagInput } from "@/components/TagInput";
import { AIPanel } from "./AIPanel";
import { useTagSuggestions, type TagSuggestion } from "@/hooks/useTagSuggestions";
import { EditorControls } from "./ContentEditor/EditorControls";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function ContentEditor() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const {
    currentContent,
    pushContent,
    undo,
    redo,
    canUndo,
    canRedo
  } = useContentHistory(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const { 
    suggestions: tagSuggestions, 
    stats: tagStats,
    loading: tagSuggestionsLoading,
    language 
  } = useAdvancedTagging(content);
  const { suggestions, loading: suggestionsLoading, setSuggestions } = useAISuggestions(content ?? "");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showApplyBar, setShowApplyBar] = useState(false);

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error("Please login to save content");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("content")
        .insert([{ user_id: user.id, content, attachments, tags }]);
      
      if (error) throw error;
      toast.success("Content saved successfully!");
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [content, attachments, user]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("attachments")
        .getPublicUrl(filePath);

      setAttachments(prev => [...prev, publicUrl]);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      
      // Undo/Redo keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          const previousContent = undo();
          setContent(previousContent);
        }
        if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          const nextContent = redo();
          setContent(nextContent);
        }
      }
    },
    [handleSave, undo, redo]
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="space-y-4 relative">
        <AnimatePresence>
          {suggestions.length > 0 && (
            <AIPanel
              suggestions={suggestions}
              loading={suggestionsLoading}
              onClose={() => setSuggestions([])}
              onApplySuggestion={(newContent) => {
                setContent(newContent);
                pushContent(newContent);
                setSuggestions([]);
              }}
              textareaRef={textareaRef}
            />
          )}
        </AnimatePresence>
        
        <div className="space-y-4">
          <TagInput
            tags={tags}
            setTags={setTags}
            tagSuggestions={tagSuggestions}
            tagSuggestionsLoading={tagSuggestionsLoading}
            tagStats={tagStats}
            language={language}
          />
          <div className="relative w-full">
            <TextareaAutosize
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                const newContent = e.target.value;
                setContent(newContent);
                pushContent(newContent);
              }}
              onKeyDown={handleKeyDown}
              placeholder={user ? "Start typing or paste your content here..." : "Please login to start adding content..."}
              className="w-full p-6 text-lg bg-white/50 backdrop-blur-sm border-2 border-primary/10 rounded-xl shadow-xl focus:outline-none focus:border-primary/30 transition-all duration-300 min-h-[300px] resize-none"
              autoFocus
              disabled={!user}
            />
          </div>
          </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

        <EditorControls
          user={user}
          content={content}
          attachments={attachments}
          isUploading={isUploading}
          isSaving={isSaving}
          canUndo={canUndo}
          canRedo={canRedo}
          onUpload={() => fileInputRef.current?.click()}
          onSave={handleSave}
          onUndo={() => {
            const previousContent = undo();
            setContent(previousContent);
          }}
          onRedo={() => {
            const nextContent = redo();
            setContent(nextContent);
          }}
        />
      </div>
    </div>
  );
}

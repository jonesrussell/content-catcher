"use client";

import { useCallback, KeyboardEvent, useState, useEffect } from "react";
import { MainEditor } from "./MainEditor";
import { useContentHistory } from "@/hooks/useContentHistory";
import { User } from "@supabase/supabase-js";

interface MainEditorSectionProps {
  content: string;
  setContent: (content: string) => void;
  user: User | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  contentId?: string;
  handleSave: (closeAfterSave?: boolean) => Promise<void>;
  isAutoSaving: boolean;
  isSaving: boolean;
}

export function MainEditorSection({
  content,
  setContent,
  user,
  textareaRef,
  contentId,
  handleSave,
  isAutoSaving,
  isSaving,
}: MainEditorSectionProps) {
  const { pushContent, undo, redo, canUndo, canRedo } =
    useContentHistory(content);
  const [isFocused, setIsFocused] = useState(false);
  const [hasContentChanged, setHasContentChanged] = useState(false);
  const [initialContent] = useState(content);

  useEffect(() => {
    setHasContentChanged(content !== initialContent);
  }, [content, initialContent]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }

      // Undo/Redo keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          const previousContent = undo();
          setContent(previousContent);
        }
        if (e.key === "y" || (e.shiftKey && e.key === "z")) {
          e.preventDefault();
          const nextContent = redo();
          setContent(nextContent);
        }
      }
    },
    [handleSave, undo, redo, setContent],
  );

  return (
    <div className="relative flex w-full flex-col gap-4">
      <MainEditor
        content={content}
        setContent={setContent}
        pushContent={pushContent}
        handleKeyDown={handleKeyDown}
        user={user}
        textareaRef={textareaRef}
        contentId={contentId}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {(isFocused || hasContentChanged) && (
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={!canUndo}
              onClick={() => {
                const previousContent = undo();
                setContent(previousContent);
              }}
              className="text-primary rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7v6h6"></path>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
              </svg>
            </button>
            <button
              disabled={!canRedo}
              onClick={() => {
                const nextContent = redo();
                setContent(nextContent);
              }}
              className="text-primary rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 7v6h-6"></path>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving || !content.trim() || !user}
              className="text-primary/70 bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving || !content.trim() || !user}
              className="text-primary/70 bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save & Close"}
            </button>
          </div>
          {isAutoSaving && (
            <span className="text-primary/60 text-sm">Auto-saving...</span>
          )}
        </div>
      )}
    </div>
  );
}

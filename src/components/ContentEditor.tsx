"use client";

import { useState, useCallback, useRef, KeyboardEvent, useEffect } from "react";
import { useContentHistory } from "@/hooks/useContentHistory";
import { TitleSection } from "./ContentEditor/TitleSection";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { MainEditor } from "./ContentEditor/MainEditor";
import { AIFeaturesSection } from "./ContentEditor/AIFeaturesSection";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import debounce from "lodash.debounce";

export default function ContentEditor() {
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
  const { pushContent, undo, redo, canUndo, canRedo } =
    useContentHistory(content);

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
      const { data, error } = await supabase
        .from("content")
        .insert([
          {
            user_id: user.id,
            content,
            tags: tags ?? [],
            created_at: new Date().toISOString(),
            version_number: 1
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        if (error.code === "23505") {
          toast.error("This content already exists");
        } else if (error.code === "23503") {
          toast.error("User profile not found. Please try logging in again.");
        } else {
          toast.error(`Failed to save: ${error.message}`);
        }
        return;
      }

      if (!data) {
        throw new Error("No data returned from insert");
      }

      toast.success("Content saved successfully!");
      
      if (closeAfterSave) {
        // Clear the editor
        setContent("");
        setTitle("");
        setTags([]);
        setTagSuggestions([]);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save content",
      );
    } finally {
      setIsSaving(false);
    }
  }, [content, tags, user]);

  // Create debounced auto-save function
  const debouncedSave = useCallback(
    debounce(() => {
      handleSave(false);
    }, 2000),
    [handleSave]
  );

  // Auto-save when content or tags change
  useEffect(() => {
    if (content.trim() && user) {
      debouncedSave();
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [content, tags, user, debouncedSave]);

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
    [handleSave, undo, redo],
  );

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4">
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[1fr_400px]">
        {/* Main Content Column */}
        <div className="relative min-h-[300px] w-full">
          {/* Title Area */}
          <div
            className={`mb-3 transition-all duration-500 sm:mb-4 ${content.length >= 100 ? "opacity-100" : "opacity-70"}`}
          >
            <div className="border-primary/10 relative w-full rounded-xl border-2 bg-white/50 p-3 backdrop-blur-sm sm:p-4">
              {content.length >= 100 ? (
                <TitleSection
                  title={title}
                  setTitle={setTitle}
                  content={content}
                  isGeneratingTitle={isGeneratingTitle}
                  setIsGeneratingTitle={setIsGeneratingTitle}
                  disabled={!user}
                />
              ) : (
                <div className="space-y-6 transition-all duration-500">
                  <div className="flex flex-col gap-2">
                    <label className="text-primary/70 text-sm font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a title..."
                      className="border-primary/20 text-primary/70 focus:ring-primary/20 w-full rounded-lg border bg-white/70 px-3 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-primary/70 bg-primary/10 rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70"
                      disabled
                    >
                      Generate Title
                    </button>
                    <span className="text-primary/70 text-xs">
                      Type more content to enable title generation
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Features Section */}
          <div
            className={`flex flex-col gap-6 transition-all duration-500 ${content.length >= 100 ? "opacity-100" : "opacity-70"}`}
          >
            {content.length >= 100 ? (
              <AIFeaturesSection
                content={content}
                tags={tags}
                setTags={setTags}
                tagSuggestions={tagSuggestions}
                tagSuggestionsLoading={tagSuggestionsLoading}
                tagStats={tagStats}
                language={language}
              />
            ) : (
              <div className="flex flex-col gap-6">
                <div className="border-primary/10 cursor-not-allowed rounded-xl border-2 bg-white/50 p-4 opacity-70 backdrop-blur-sm">
                  <h3 className="text-primary/70 mb-4 text-lg font-medium">
                    Tags
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="border-primary/20 flex min-h-[40px] flex-wrap gap-2 rounded-lg border bg-white/70 p-2">
                        <span className="text-primary/70 text-xs">
                          Tags will appear here...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Textarea and Controls */}
        <div className="relative flex w-full flex-col gap-4">
          <MainEditor
            content={content}
            setContent={setContent}
            pushContent={pushContent}
            handleKeyDown={handleKeyDown}
            user={user}
            textareaRef={textareaRef}
            contentId={undefined}
          />
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
                className="text-primary/70 bg-primary/10 rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 hover:bg-primary/20 transition-colors"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving || !content.trim() || !user}
                className="text-primary/70 bg-primary/10 rounded-lg px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70 hover:bg-primary/20 transition-colors"
              >
                {isSaving ? "Saving..." : "Save & Close"}
              </button>
            </div>
            {isAutoSaving && (
              <span className="text-primary/60 text-sm">Auto-saving...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

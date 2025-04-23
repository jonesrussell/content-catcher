"use client";

import { useState, useCallback, useRef, KeyboardEvent, useEffect } from "react";
import { InlineSuggestions } from "./ContentEditor/InlineSuggestions";
import { useContentHistory } from "@/hooks/useContentHistory";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { TitleSection } from "./ContentEditor/TitleSection";
import { TitleGenerator } from "./ContentEditor/TitleGenerator";
import { useAdvancedTagging } from "@/hooks/useAdvancedTagging";
import { TagInput } from "@/components/TagInput";
import { AIPanel } from "./AIPanel";
import { useTagSuggestions } from "@/hooks/useTagSuggestions";
import { EditorControls } from "./ContentEditor/EditorControls";
import { MainEditor } from "./ContentEditor/MainEditor";
import { AIFeaturesSection } from "./ContentEditor/AIFeaturesSection";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function ContentEditor() {
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Custom hooks
  const {
    currentContent,
    pushContent,
    undo,
    redo,
    canUndo,
    canRedo
  } = useContentHistory(content);

  const {
    suggestions: initialTagSuggestions,
    stats: tagStats,
    loading: tagSuggestionsLoading,
    language
  } = useAdvancedTagging(content);

  const [tagSuggestions, setTagSuggestions] = useState<typeof initialTagSuggestions>(initialTagSuggestions);

  useEffect(() => {
    setTagSuggestions(initialTagSuggestions);
  }, [initialTagSuggestions]);

  const {
    suggestions,
    loading: suggestionsLoading,
    setSuggestions
  } = useAISuggestions(content);

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error("Please login to save content");
      return;
    }

    if (!content.trim()) {
      toast.error("Cannot save empty content");
      return;
    }

    setIsSaving(true);
    
    // Subscribe to real-time updates for this content
    const channel = supabase.channel(`content:${Date.now()}`); // Use timestamp as temporary ID until saved
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to content updates');
      }
    });
    try {
      const { data, error } = await supabase
        .from("content")
        .insert([{ 
          user_id: user.id, 
          content, 
          attachments: attachments ?? [], 
          tags: tags ?? [],
          created_at: new Date().toISOString(),
          version_number: 1,
          updated_at: new Date().toISOString()
        }])
        .select('*')
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
        throw new Error('No data returned from insert');
      }

      const savedContent = {
        id: data.id,
        content,
        tags,
        attachments,
        created_at: new Date().toISOString(),
        user_id: user.id,
        version_number: 1
      };

      // Show success animation and scroll to saved content
      const savedContentSection = document.querySelector('.saved-content-section');
      if (savedContentSection) {
        savedContentSection.classList.add('highlight-new-content');
        savedContentSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        setTimeout(() => {
          savedContentSection.classList.remove('highlight-new-content');
        }, 2000);
      }

      toast.success("Content saved successfully!");
      
      // Clear form with a slight delay for better UX
      setTimeout(() => {
        setContent("");
        setTitle("");
        setTags([]);
        setAttachments([]);
        setSuggestions([]); // Clear AI suggestions
        setTagSuggestions([]); // Clear tag suggestions
      }, 300);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [content, attachments, tags, title, user]);

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
    <div className="relative w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:grid md:grid-cols-[1fr,400px] gap-6">
        {/* Main Content Column */}
        <div className="relative w-full min-h-[300px]">
          {/* Title Area */}
          <div className={`mb-3 sm:mb-4 transition-all duration-500 ${content.length >= 100 ? 'opacity-100' : 'opacity-40'}`}>
            <div className="relative w-full bg-white/30 backdrop-blur-sm rounded-xl border-2 border-primary/5 p-3 sm:p-4">
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
                    <label className="text-sm font-medium text-primary/30">Title</label>
                    <input
                      type="text"
                      placeholder="Enter a title..."
                      className="w-full px-3 py-2 bg-white/50 border border-primary/10 rounded-lg text-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 text-sm font-medium text-primary/30 bg-primary/5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    >
                      Generate Title
                    </button>
                    <span className="text-xs text-primary/30">Type more content to enable title generation</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Features Section */}
          <div className={`space-y-6 transition-all duration-500 ${content.length >= 100 ? 'opacity-100' : 'opacity-50'}`}>
            {content.length >= 100 ? (
              <AIFeaturesSection
                content={content}
                title={title}
                setTitle={setTitle}
                isGeneratingTitle={isGeneratingTitle}
                setIsGeneratingTitle={setIsGeneratingTitle}
                tags={tags}
                setTags={setTags}
                tagSuggestions={tagSuggestions}
                tagSuggestionsLoading={tagSuggestionsLoading}
                tagStats={tagStats}
                language={language}
                suggestions={suggestions}
                suggestionsLoading={suggestionsLoading}
                setSuggestions={setSuggestions}
                setTagSuggestions={setTagSuggestions}
                onApplySuggestion={(newContent: string) => {
                  setContent(newContent);
                  pushContent(newContent);
                  setSuggestions([]);
                }}
                textareaRef={textareaRef}
                disabled={!user}
              />
            ) : (
              <div className="space-y-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl border-2 border-primary/5 p-4 opacity-50 cursor-not-allowed">
                  <h3 className="text-lg font-medium text-primary/20 mb-4">AI Features</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-primary/20">Tags</label>
                      <div className="flex flex-wrap gap-2 p-2 bg-white/30 border border-primary/5 rounded-lg min-h-[40px]">
                        <span className="text-xs text-primary/20">Tags will appear here...</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-primary/20">AI Suggestions</label>
                      <div className="p-4 bg-white/30 border border-primary/5 rounded-lg">
                        <p className="text-sm text-primary/20">Type more content to enable AI suggestions</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-primary/20">Content Analysis</label>
                      <div className="p-4 bg-white/30 border border-primary/5 rounded-lg">
                        <p className="text-sm text-primary/20">Content analysis will appear here...</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 rounded-xl pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        {/* Right Column - Textarea and Controls */}
        <div className="relative w-full flex flex-col gap-4">
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
                className="p-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="p-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 7v6h-6"></path>
                  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
                </svg>
              </button>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" x2="12" y1="3" y2="15"></line>
              </svg>
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

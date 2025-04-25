"use client";

import { TitleSection } from "./TitleSection";
import { AIFeaturesSection } from "./AIFeaturesSection";
import { MainEditorSection } from "./MainEditorSection";
import { User } from "@supabase/supabase-js";
import { TagAnalysis, TagStats } from "@/hooks/useAdvancedTagging";

interface ContentEditorLayoutProps {
  content: string;
  setContent: (content: string) => void;
  title: string;
  setTitle: (title: string) => void;
  isGeneratingTitle: boolean;
  setIsGeneratingTitle: (value: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  user: User | null;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleSave: (closeAfterSave?: boolean) => Promise<void>;
  isAutoSaving: boolean;
  isSaving: boolean;
  tagSuggestions: TagAnalysis[];
  tagSuggestionsLoading: boolean;
  tagStats: TagStats | null;
  language: string;
}

export function ContentEditorLayout({
  content,
  setContent,
  title,
  setTitle,
  isGeneratingTitle,
  setIsGeneratingTitle,
  tags,
  setTags,
  user,
  textareaRef,
  handleSave,
  isAutoSaving,
  isSaving,
  tagSuggestions,
  tagSuggestionsLoading,
  tagStats,
  language,
}: ContentEditorLayoutProps) {
  return (
    <div className="relative mx-auto w-full max-w-4xl px-4">
      <div className="flex flex-col gap-4">
        {/* Title Section - Integrated at the top */}
        <div className="border-primary/10 rounded-t-xl border-2 bg-white/50 p-4 backdrop-blur-sm">
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
            <div className="space-y-4">
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

        {/* Main Editor Section - Middle section */}
        <div className="border-primary/10 border-x-2 bg-white/50 backdrop-blur-sm">
          <MainEditorSection
            content={content}
            setContent={setContent}
            user={user}
            textareaRef={textareaRef}
            handleSave={handleSave}
            isAutoSaving={isAutoSaving}
            isSaving={isSaving}
          />
        </div>

        {/* Tags Section - Bottom section */}
        <div className="border-primary/10 rounded-b-xl border-2 bg-white/50 p-4 backdrop-blur-sm">
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
            <div className="space-y-4">
              <h3 className="text-primary/70 text-lg font-medium">Tags</h3>
              <div className="flex flex-col gap-2">
                <div className="border-primary/20 flex min-h-[40px] flex-wrap gap-2 rounded-lg border bg-white/70 p-2">
                  <span className="text-primary/70 text-xs">
                    Tags will appear here...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
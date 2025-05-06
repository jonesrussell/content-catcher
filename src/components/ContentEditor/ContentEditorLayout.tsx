"use client";

import { TitleSection } from "./TitleSection";
import { AIFeaturesSection } from "./AIFeaturesSection";
import { MainEditorSection } from "./MainEditorSection";
import { User } from "@supabase/supabase-js";

interface ContentEditorLayoutProps {
  content: string;
  setContent: (content: string) => void;
  title: string;
  setTitle: (title: string) => void;
  isGeneratingTitle: boolean;
  setIsGeneratingTitle: (isGenerating: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  user: User | null;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  handleSave: (closeAfterSave?: boolean) => Promise<void>;
  isAutoSaving: boolean;
  isSaving: boolean;
  tagSuggestions: string[];
  tagSuggestionsLoading: boolean;
  onFocus?: () => void;
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
  onFocus,
}: ContentEditorLayoutProps) {
  return (
    <div className="relative mx-auto w-full max-w-4xl px-4">
      <div className="flex flex-col gap-4">
        {/* Title Section - Only show when title exists */}
        {title && (
          <div className="border-primary/10 rounded-t-xl border-2 bg-white/50 p-4 backdrop-blur-sm">
            <TitleSection
              title={title}
              setTitle={setTitle}
              content={content}
              isGeneratingTitle={isGeneratingTitle}
              setIsGeneratingTitle={setIsGeneratingTitle}
              disabled={!user}
            />
          </div>
        )}

        {/* Main Editor Section - Middle section */}
        <div className={`border-primary/10 ${title ? 'border-x-2' : 'rounded-t-xl border-2'} bg-white/50 backdrop-blur-sm`}>
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
              tagSuggestions={tagSuggestions.map(tag => ({
                tag,
                confidence: 1,
                category: 'topic',
                source: 'rules',
                metadata: {},
                explanation: 'Auto-generated tag'
              }))}
              tagSuggestionsLoading={tagSuggestionsLoading}
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
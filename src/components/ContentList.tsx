"use client";

import { useState } from "react";
import type { Content } from "@/types/content";
import { EditContentModal } from "./ContentEditor/EditContentModal";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ContentListProps {
  contents: Content[];
  onContentUpdated?: () => void;
}

export function ContentList({ contents, onContentUpdated }: ContentListProps) {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {contents.map((content) => (
        <div
          key={content.id}
          className="group saved-content-item border-primary/5 relative mb-8 rounded-xl border bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
          tabIndex={0}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedContent(content);
                setIsEditModalOpen(true);
              }}
              className="hover:bg-primary/5 rounded-full p-2"
              title="Edit"
            >
              <Pencil className="text-primary/70 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <p className="text-primary/80 text-base leading-relaxed whitespace-pre-wrap">
              {content.content}
            </p>
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-primary/60 flex items-center justify-between text-xs">
              <span>{new Date(content.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContent(null);
        }}
        content={selectedContent}
        onContentSaved={() => {
          onContentUpdated?.();
          window.location.reload();
        }}
      />
    </div>
  );
}

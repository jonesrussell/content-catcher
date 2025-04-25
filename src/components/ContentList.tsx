"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, ArrowUpCircle, Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import type { Content, ContentUpdate } from "@/hooks/useContent";
import { EditContentModal } from "./ContentEditor/EditContentModal";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";

interface ContentListProps {
  contents: Content[];
  onContentUpdated?: () => void;
}

export function ContentList({ contents, onContentUpdated }: ContentListProps) {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {contents.map((content) => (
        <div
          key={content.id}
          className="border-primary/10 rounded-lg border-2 bg-white/50 p-4 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{content.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {content.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedContent(content);
                setIsEditModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
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
        }}
      />
    </div>
  );
}

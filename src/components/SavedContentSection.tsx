import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MasonryGrid } from "@/components/SavedContent/MasonryGrid";
import { EditContentModal } from "@/components/ContentEditor/EditContentModal";
import type { Content } from "@/types/content";
import { useContent } from "@/lib/content-context";

interface SavedContentSectionProps {
  onContentUpdated?: () => void;
  initialContents?: Content[];
}

export function SavedContentSection({ onContentUpdated, initialContents }: SavedContentSectionProps) {
  const { contents, loading, error } = useContent();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewContentModalOpen, setIsNewContentModalOpen] = useState(false);

  const handleEdit = (content: Content) => {
    setSelectedContent(content);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    setIsEditModalOpen(false);
    onContentUpdated?.();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const displayContents = initialContents || contents;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Content</h2>
        <Button onClick={() => setIsNewContentModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </Button>
      </div>

      <MasonryGrid
        content={displayContents}
        onEdit={handleEdit}
        onDelete={() => onContentUpdated?.()}
      />

      {selectedContent && (
        <EditContentModal
          content={selectedContent}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <EditContentModal
        content={null}
        isOpen={isNewContentModalOpen}
        onClose={() => setIsNewContentModalOpen(false)}
        isNew={true}
        onContentSaved={() => {
          setIsNewContentModalOpen(false);
          onContentUpdated?.();
        }}
      />
    </div>
  );
} 
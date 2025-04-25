"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ContentEditor } from "../ContentEditor";
import { Content } from "@/types/content";

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onContentSaved?: () => void;
}

export function EditContentModal({
  isOpen,
  onClose,
  content,
  onContentSaved,
}: EditContentModalProps) {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <ContentEditor
          initialContent={content.content}
          initialTitle={content.title}
          initialTags={content.tags}
          onContentSaved={() => {
            onContentSaved?.();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
} 
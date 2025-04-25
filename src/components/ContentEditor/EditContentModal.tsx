"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ContentEditor from "../ContentEditor";
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
      <DialogContent className="w-full max-w-full">
        <DialogTitle>Edit Content</DialogTitle>
        <DialogDescription>
          Make changes to your content here. Click save when you&apos;re done.
        </DialogDescription>
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
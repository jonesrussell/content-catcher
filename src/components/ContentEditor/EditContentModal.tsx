"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ContentEditor from "../ContentEditor";
import { Content } from "@/types/content";
import { DialogHeader } from "@/components/ui/dialog";

interface EditContentModalProps {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  isNew?: boolean;
  onContentSaved?: () => void;
}

export function EditContentModal({ 
  content, 
  isOpen, 
  onClose, 
  onSave,
  isNew = false,
  onContentSaved 
}: EditContentModalProps) {
  const handleSave = () => {
    onSave?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "Create New Content" : "Edit Content"}</DialogTitle>
        </DialogHeader>
        <ContentEditor
          initialContent={content || undefined}
          onContentSaved={isNew ? onContentSaved : handleSave}
        />
      </DialogContent>
    </Dialog>
  );
} 
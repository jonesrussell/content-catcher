"use client";

import { motion } from "framer-motion";
import { Save, Upload, FileText } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface ActionButtonsProps {
  user: User | null;
  content: string;
  attachments: string[];
  isUploading: boolean;
  isSaving: boolean;
  onUpload: () => void;
  onSave: () => void;
}

export function ActionButtons({
  user,
  content,
  attachments,
  isUploading,
  isSaving,
  onUpload,
  onSave,
}: ActionButtonsProps) {
  return (
    <div className="absolute right-6 bottom-6 flex items-center gap-3">
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2">
          <FileText className="text-primary h-4 w-4" />
          <span className="text-primary text-sm">
            {attachments.length} files
          </span>
        </div>
      )}

      {user && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onUpload}
          disabled={isUploading}
          className="text-primary flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg transition-colors hover:bg-white/90 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </motion.button>
      )}

      {content && user && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={onSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 text-white shadow-lg transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </motion.button>
      )}
    </div>
  );
}

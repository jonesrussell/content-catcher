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
  onSave
}: ActionButtonsProps) {
  return (
    <div className="absolute bottom-6 right-6 flex items-center gap-3">
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">{attachments.length} files</span>
        </div>
      )}
      
      {user && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
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
          className="px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </motion.button>
      )}
    </div>
  );
}

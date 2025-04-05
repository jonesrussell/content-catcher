"use client";

import { motion } from "framer-motion";
import { Save, Upload, FileText } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface EditorControlsProps {
  user: User | null;
  content: string;
  attachments: string[];
  isUploading: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUpload: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function EditorControls({
  user,
  content,
  attachments,
  isUploading,
  isSaving,
  canUndo,
  canRedo,
  onUpload,
  onSave,
  onUndo,
  onRedo
}: EditorControlsProps) {
  return (
    <div className="fixed md:absolute bottom-4 md:bottom-6 right-4 md:right-6 flex items-center gap-2 md:gap-3 z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 bg-white text-primary rounded-lg shadow-lg hover:bg-white/90 
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
      </div>

      {attachments.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">{attachments.length} files</span>
        </div>
      )}
      
      {user ? (
        <>
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

          {content && (
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
        </>
      ) : (
        <a
          href="/login"
          className="px-4 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          Login
        </a>
      )}
    </div>
  );
}

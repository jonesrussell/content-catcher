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
  onRedo,
}: EditorControlsProps) {
  return (
    <div className="fixed right-4 bottom-4 z-10 flex items-center gap-2 md:absolute md:right-6 md:bottom-6 md:gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="text-primary rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="text-primary rounded-lg bg-white p-2 shadow-lg transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2">
          <FileText className="text-primary h-4 w-4" />
          <span className="text-primary text-sm">
            {attachments.length} files
          </span>
        </div>
      )}

      {user ? (
        <>
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

          {content && (
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
        </>
      ) : (
        <a
          href="/login"
          className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white shadow-lg transition-colors"
        >
          Login
        </a>
      )}
    </div>
  );
}

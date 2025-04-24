"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Content } from "@/hooks/useContent";

interface VersionEditModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function VersionEditModal({
  content,
  isOpen,
  onClose,
  onSave,
}: VersionEditModalProps) {
  const [versionComment, setVersionComment] = useState("");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 w-full max-w-4xl rounded-xl bg-white p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-primary text-xl font-semibold">Edit Content</h3>
          <button
            onClick={onClose}
            className="hover:bg-primary/5 rounded-full p-2 transition-colors"
          >
            <X className="text-primary/70 h-5 w-5" />
          </button>
        </div>

        <textarea
          value={content.content}
          onChange={(e) => {
            const newContent = { ...content, content: e.target.value };
            Object.assign(content, newContent);
          }}
          className="focus:ring-primary/20 mb-4 min-h-[200px] w-full rounded-lg border p-4 focus:ring-2 focus:outline-none"
        />

        <div className="mb-4 flex items-center gap-4">
          <input
            type="text"
            value={versionComment}
            onChange={(e) => setVersionComment(e.target.value)}
            placeholder="Add a version comment (optional)"
            className="focus:ring-primary/20 flex-grow rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-primary hover:bg-primary/5 rounded-lg px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

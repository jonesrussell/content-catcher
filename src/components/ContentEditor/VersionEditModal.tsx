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

export function VersionEditModal({ content, isOpen, onClose, onSave }: VersionEditModalProps) {
  const [versionComment, setVersionComment] = useState("");

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary">Edit Content</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-primary/70" />
          </button>
        </div>

        <textarea
          value={content.content}
          onChange={(e) => {
            const newContent = { ...content, content: e.target.value };
            Object.assign(content, newContent);
          }}
          className="w-full p-4 border rounded-lg min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={versionComment}
            onChange={(e) => setVersionComment(e.target.value)}
            placeholder="Add a version comment (optional)"
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

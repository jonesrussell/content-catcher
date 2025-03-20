"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, History, RotateCcw } from "lucide-react";
import { useContentVersions } from "@/hooks/useContentVersions";
import type { ContentVersion } from "@/hooks/useContent";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import type { Content } from "@/hooks/useContent";

interface EditContentModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditContentModal({ content, isOpen, onClose }: EditContentModalProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [versionComment, setVersionComment] = useState("");
  const { versions, loading: versionsLoading, createVersion, revertToVersion } = useContentVersions(content?.id);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('content')
        .update({
          content: content.content,
          version_number: (content.version_number || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) throw error;
      
      await createVersion(content, versionComment);
      toast.success('Content updated and version saved');
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update content');
    }
  };

  const handleRevert = async (version: ContentVersion) => {
    try {
      await revertToVersion(version);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error reverting version:', error);
    }
  };

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
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Version History
          </button>
        </div>

        {showVersions && (
          <div className="mb-4 max-h-60 overflow-y-auto border rounded-lg">
            {versionsLoading ? (
              <div className="p-4 text-center text-primary/60">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="p-4 text-center text-primary/60">No previous versions</div>
            ) : (
              <div className="divide-y">
                {versions.map((version) => (
                  <div key={version.id} className="p-4 hover:bg-primary/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary/80">
                        Version {version.version_number} - {new Date(version.created_at).toLocaleString()}
                      </p>
                      {version.comment && (
                        <p className="text-sm text-primary/60 mt-1">{version.comment}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRevert(version)}
                      className="px-3 py-1 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Revert
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

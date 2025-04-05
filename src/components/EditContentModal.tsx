  const [showVersions, setShowVersions] = useState(false);
  const [versionComment, setVersionComment] = useState("");
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffVersions, setDiffVersions] = useState<{
    oldVersion: ContentVersion;
    newVersion: ContentVersion;
  } | null>(null);
  const { versions, loading: versionsLoading, createVersion, revertToVersion } = useContentVersions(content?.id);

  if (!isOpen) {
    return null;
  }

  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      toast.error('Please select exactly 2 versions to compare');
      return;
    }

    const versionA = versions.find(v => v.id === selectedVersions[0]);
    const versionB = versions.find(v => v.id === selectedVersions[1]);

    if (!versionA || !versionB) {
      toast.error('Selected versions not found');
      return;
    }

    // Ensure older version is first
    const [oldVersion, newVersion] = versionA.version_number < versionB.version_number 
      ? [versionA, versionB] 
      : [versionB, versionA];

    setDiffVersions({ oldVersion, newVersion });
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

"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { useContentVersions } from "@/hooks/useContentVersions";
import type { Content } from "@/hooks/useContent";
import { VersionEditModal } from "./ContentEditor/VersionEditModal";

interface EditContentModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditContentModal({ content, isOpen, onClose }: EditContentModalProps) {
  const handleSave = async () => {
    if (!content.content.trim()) {
      toast.error("Cannot save empty content");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('content')
        .update({
          content: content.content,
          updated_at: new Date().toISOString(),
          tags: content.tags ?? [],
          attachments: content.attachments ?? [],
          version_number: (content.version_number ?? 0) + 1
        })
        .eq('id', content.id);

      if (updateError) {
        console.error("Update error:", updateError);
        if (updateError.code === "23505") {
          toast.error("This content already exists");
        } else if (updateError.code === "23503") {
          toast.error("User profile not found. Please try logging in again.");
        } else {
          toast.error(`Failed to update: ${updateError.message}`);
        }
        return;
      }
      
      try {
        await createVersion(content, versionComment);
        toast.success('Content updated and version saved');
        onClose();
        window.location.reload();
      } catch (versionError) {
        console.error("Version creation error:", versionError);
        toast.error("Content updated but failed to save version");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update content");
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      toast.error('Please select exactly 2 versions to compare');
      return;
    }

    const versionA = versions.find(v => v.id === selectedVersions[0]);
    const versionB = versions.find(v => v.id === selectedVersions[1]);

    if (!versionA || !versionB) {
      toast.error('Selected versions not found');
      return;
    }

    const [oldVersion, newVersion] = versionA.version_number < versionB.version_number 
      ? [versionA, versionB] 
      : [versionB, versionA];

    setDiffVersions({ oldVersion, newVersion });
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-primary">Version History</h4>
                  {selectedVersions.length === 2 && (
                    <button
                      onClick={handleCompareVersions}
                      className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      Compare Selected
                    </button>
                  )}
                </div>

                <div className="divide-y">
                  {versions.map((version) => (
                    <div key={version.id} className="p-4 hover:bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(version.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedVersions.length < 2) {
                                  setSelectedVersions([...selectedVersions, version.id]);
                                }
                              } else {
                                setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                              }
                            }}
                            className="rounded border-primary/20"
                          />
                          <div>
                            <p className="text-sm text-primary/80">
                              Version {version.version_number} - {new Date(version.created_at).toLocaleString()}
                            </p>
                            {version.comment && (
                              <p className="text-sm text-primary/60 mt-1">{version.comment}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevert(version)}
                          className="px-3 py-1 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Revert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {diffVersions && (
                    <DiffViewer
                      oldVersion={diffVersions.oldVersion}
                      newVersion={diffVersions.newVersion}
                      onClose={() => setDiffVersions(null)}
                    />
                  )}
                </AnimatePresence>
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
    if (!content.content.trim()) {
      toast.error("Cannot save empty content");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('content')
        .update({
          content: content.content,
          updated_at: new Date().toISOString(),
          tags: content.tags ?? [],
          attachments: content.attachments ?? [],
          version_number: (content.version_number ?? 0) + 1
        })
        .eq('id', content.id);

      if (updateError) {
        console.error("Update error:", updateError);
        if (updateError.code === "23505") {
          toast.error("This content already exists");
        } else if (updateError.code === "23503") {
          toast.error("User profile not found. Please try logging in again.");
        } else {
          toast.error(`Failed to update: ${updateError.message}`);
        }
        return;
      }
      
      try {
        await createVersion(content, versionComment);
        toast.success('Content updated and version saved');
        onClose();
        window.location.reload();
      } catch (versionError) {
        console.error("Version creation error:", versionError);
        toast.error("Content updated but failed to save version");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update content");
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      toast.error('Please select exactly 2 versions to compare');
      return;
    }

    const versionA = versions.find(v => v.id === selectedVersions[0]);
    const versionB = versions.find(v => v.id === selectedVersions[1]);

    if (!versionA || !versionB) {
      toast.error('Selected versions not found');
      return;
    }

    // Ensure older version is first
    const [oldVersion, newVersion] = versionA.version_number < versionB.version_number 
      ? [versionA, versionB] 
      : [versionB, versionA];

    setDiffVersions({ oldVersion, newVersion });
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-primary">Version History</h4>
                  {selectedVersions.length === 2 && (
                    <button
                      onClick={handleCompareVersions}
                      className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      Compare Selected
                    </button>
                  )}
                </div>

                <div className="divide-y">
                  {versions.map((version) => (
                    <div key={version.id} className="p-4 hover:bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(version.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedVersions.length < 2) {
                                  setSelectedVersions([...selectedVersions, version.id]);
                                }
                              } else {
                                setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                              }
                            }}
                            className="rounded border-primary/20"
                          />
                          <div>
                            <p className="text-sm text-primary/80">
                              Version {version.version_number} - {new Date(version.created_at).toLocaleString()}
                            </p>
                            {version.comment && (
                              <p className="text-sm text-primary/60 mt-1">{version.comment}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevert(version)}
                          className="px-3 py-1 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Revert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {diffVersions && (
                    <DiffViewer
                      oldVersion={diffVersions.oldVersion}
                      newVersion={diffVersions.newVersion}
                      onClose={() => setDiffVersions(null)}
                    />
                  )}
                </AnimatePresence>
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

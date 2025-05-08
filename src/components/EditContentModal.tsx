"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import { useContentVersions } from "@/hooks/useContentVersions";
import type { Content, ContentVersion } from "@/types/content";
import { X, History, RotateCcw } from "lucide-react";
import { DiffViewer } from "./ContentEditor/DiffViewer";

interface EditContentModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditContentModal({
  content,
  isOpen,
  onClose,
}: EditContentModalProps) {
  const [showVersions, setShowVersions] = useState(false);
  const [versionComment, setVersionComment] = useState("");
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffVersions, setDiffVersions] = useState<{
    oldVersion: ContentVersion;
    newVersion: ContentVersion;
  } | null>(null);
  const {
    versions,
    loading: versionsLoading,
    createVersion,
    revertToVersion,
  } = useContentVersions(content.id);
  const supabase = createClient();

  const handleSave = async () => {
    try {
      const { error: updateError } = await supabase
        .from("content")
        .update({
          content: content.content,
          updated_at: new Date().toISOString(),
          tags: content.tags ?? [],
          attachments: content.attachments ?? [],
          version_number: (content.version_number ?? 0) + 1,
        })
        .eq("id", content.id);

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

      await createVersion(content, versionComment);
      setVersionComment("");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to update content");
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      toast.error("Please select exactly 2 versions to compare");
      return;
    }

    const versionA = versions.find(
      (v: ContentVersion) => v.id === selectedVersions[0],
    );
    const versionB = versions.find(
      (v: ContentVersion) => v.id === selectedVersions[1],
    );

    if (!versionA || !versionB) {
      toast.error("Selected versions not found");
      return;
    }

    // Ensure older version is first
    const [oldVersion, newVersion] =
      versionA.version_number < versionB.version_number
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
      console.error("Error reverting version:", error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-4xl rounded-xl bg-white p-6">
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
            content.content = e.target.value;
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
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="text-primary hover:bg-primary/5 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
          >
            <History className="h-4 w-4" />
            Version History
          </button>
        </div>

        {showVersions && (
          <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border">
            {versionsLoading ? (
              <div className="text-primary/60 p-4 text-center">
                Loading versions...
              </div>
            ) : versions.length === 0 ? (
              <div className="text-primary/60 p-4 text-center">
                No previous versions
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-primary text-sm font-medium">
                    Version History
                  </h4>
                  {selectedVersions.length === 2 && (
                    <button
                      onClick={handleCompareVersions}
                      className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1 text-sm text-white transition-colors"
                    >
                      Compare Selected
                    </button>
                  )}
                </div>

                <div className="divide-y">
                  {versions.map((version: ContentVersion) => (
                    <div key={version.id} className="hover:bg-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(version.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (selectedVersions.length < 2) {
                                  setSelectedVersions([
                                    ...selectedVersions,
                                    version.id,
                                  ]);
                                }
                              } else {
                                setSelectedVersions(
                                  selectedVersions.filter(
                                    (id) => id !== version.id,
                                  ),
                                );
                              }
                            }}
                            className="border-primary/20 rounded"
                          />
                          <div>
                            <p className="text-primary/80 text-sm">
                              Version {version.version_number} -{" "}
                              {new Date(version.created_at).toLocaleString()}
                            </p>
                            {version.comment && (
                              <p className="text-primary/60 mt-1 text-sm">
                                {version.comment}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevert(version)}
                          className="text-primary hover:bg-primary/10 flex items-center gap-2 rounded-lg px-3 py-1 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Revert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {diffVersions && (
                  <DiffViewer
                    oldVersion={diffVersions.oldVersion}
                    newVersion={diffVersions.newVersion}
                    onClose={() => setDiffVersions(null)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-primary hover:bg-primary/5 rounded-lg px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

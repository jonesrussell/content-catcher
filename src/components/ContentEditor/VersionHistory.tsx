"use client";

import { RotateCcw } from "lucide-react";
import type { ContentVersion } from "@/hooks/useContent";
import { DiffViewer } from "./DiffViewer";

interface VersionHistoryProps {
  versions: ContentVersion[];
  loading: boolean;
  selectedVersions: string[];
  setSelectedVersions: (versions: string[]) => void;
  onCompare: () => void;
  onRevert: (version: ContentVersion) => void;
  diffVersions: {
    oldVersion: ContentVersion;
    newVersion: ContentVersion;
  } | null;
  setDiffVersions: (
    versions: { oldVersion: ContentVersion; newVersion: ContentVersion } | null,
  ) => void;
}

export function VersionHistory({
  versions,
  loading,
  selectedVersions,
  setSelectedVersions,
  onCompare,
  onRevert,
  diffVersions,
  setDiffVersions,
}: VersionHistoryProps) {
  if (loading) {
    return (
      <div className="text-primary/60 p-4 text-center">Loading versions...</div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-primary/60 p-4 text-center">
        No previous versions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-primary text-sm font-medium">Version History</h4>
        {selectedVersions.length === 2 && (
          <button
            onClick={onCompare}
            className="bg-primary hover:bg-primary/90 rounded-lg px-3 py-1 text-sm text-white transition-colors"
          >
            Compare Selected
          </button>
        )}
      </div>

      <div className="divide-y">
        {versions.map((version) => (
          <div key={version.id} className="hover:bg-primary/5 p-4">
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
                      setSelectedVersions(
                        selectedVersions.filter((id) => id !== version.id),
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
                onClick={() => onRevert(version)}
                className="text-primary hover:bg-primary/10 flex items-center gap-2 rounded-lg px-3 py-1 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Revert
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        {diffVersions && (
          <DiffViewer
            oldVersion={diffVersions.oldVersion}
            newVersion={diffVersions.newVersion}
            onClose={() => setDiffVersions(null)}
          />
        )}
      </div>
    </div>
  );
}

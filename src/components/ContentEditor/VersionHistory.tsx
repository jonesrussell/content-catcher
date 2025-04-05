"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  diffVersions: { oldVersion: ContentVersion; newVersion: ContentVersion; } | null;
  setDiffVersions: (versions: { oldVersion: ContentVersion; newVersion: ContentVersion; } | null) => void;
}

export function VersionHistory({
  versions,
  loading,
  selectedVersions,
  setSelectedVersions,
  onCompare,
  onRevert,
  diffVersions,
  setDiffVersions
}: VersionHistoryProps) {
  if (loading) {
    return <div className="p-4 text-center text-primary/60">Loading versions...</div>;
  }

  if (versions.length === 0) {
    return <div className="p-4 text-center text-primary/60">No previous versions</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-primary">Version History</h4>
        {selectedVersions.length === 2 && (
          <button
            onClick={onCompare}
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
                onClick={() => onRevert(version)}
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
  );
}

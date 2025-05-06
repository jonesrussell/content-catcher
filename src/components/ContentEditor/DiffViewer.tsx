"use client";

import { motion } from "framer-motion";
import { diffWords, Change } from "diff";
import { ContentVersion } from "@/types";

interface DiffViewerProps {
  oldVersion: ContentVersion;
  newVersion: ContentVersion;
  onClose: () => void;
}

export function DiffViewer({
  oldVersion,
  newVersion,
  onClose,
}: DiffViewerProps) {
  const differences = diffWords(oldVersion.content, newVersion.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      <div className="flex max-h-[80vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="text-primary text-lg font-semibold">
              Compare Versions
            </h3>
            <p className="text-primary/60 text-sm">
              Version {oldVersion.version_number} → Version{" "}
              {newVersion.version_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-primary/5 rounded-lg p-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/70"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-auto p-4">
          <div className="rounded-lg border bg-white">
            <div className="grid grid-cols-2 divide-x">
              <div className="p-4">
                <h4 className="text-primary mb-2 text-sm font-medium">Old Version</h4>
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {differences.map((part: Change, index: number) => (
                    <span
                      key={index}
                      className={part.removed ? "bg-red-100 text-red-800" : ""}
                    >
                      {part.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-primary mb-2 text-sm font-medium">New Version</h4>
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {differences.map((part: Change, index: number) => (
                    <span
                      key={index}
                      className={part.added ? "bg-green-100 text-green-800" : ""}
                    >
                      {part.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {oldVersion.tags?.length > 0 || newVersion.tags?.length > 0 ? (
          <div className="border-t p-4">
            <h4 className="text-primary mb-2 text-sm font-medium">
              Tag Changes
            </h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-primary/60 mb-1 text-xs">Old Tags</p>
                <div className="flex flex-wrap gap-2">
                  {oldVersion.tags?.map((tag, index) => (
                    <span
                      key={`old-${index}`}
                      className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-primary/60 mb-1 text-xs">New Tags</p>
                <div className="flex flex-wrap gap-2">
                  {newVersion.tags?.map((tag, index) => (
                    <span
                      key={`new-${index}`}
                      className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import ReactDiffViewer from "react-diff-viewer";
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
          <ReactDiffViewer
            oldValue={oldVersion.content}
            newValue={newVersion.content}
            splitView={true}
            useDarkTheme={false}
            styles={{
              variables: {
                light: {
                  diffViewerBackground: "#ffffff",
                  diffViewerColor: "#333333",
                  addedBackground: "#e6ffec",
                  addedColor: "#1a7f37",
                  removedBackground: "#ffebe9",
                  removedColor: "#cf222e",
                  wordAddedBackground: "#abf2bc",
                  wordRemovedBackground: "#ffd7d5",
                  addedGutterBackground: "#ccffd8",
                  removedGutterBackground: "#ffdcd8",
                  gutterBackground: "#f6f8fa",
                  gutterBackgroundDark: "#f0f1f2",
                  highlightBackground: "#fffbdd",
                  highlightGutterBackground: "#fff5b1",
                },
              },
            }}
          />
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

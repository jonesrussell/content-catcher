"use client";

import { toast } from "react-hot-toast";

interface TitleGeneratorProps {
  content: string;
  onTitleGenerated: (title: string) => void;
  isGenerating: boolean;
}

export function TitleGenerator({
  content,
  onTitleGenerated,
  isGenerating,
}: TitleGeneratorProps) {
  return (
    <button
      onClick={() => {
        if (!content || content.length < 50) {
          toast.error("Please add more content first (at least 50 characters)");
          return;
        }
        onTitleGenerated(content);
      }}
      className={`bg-primary hover:bg-primary/90 absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-all duration-200 ${isGenerating ? "cursor-not-allowed opacity-75" : "hover:scale-102"}`}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white/100" />
          <span className="animate-pulse">Generating title...</span>
        </>
      ) : (
        <>
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
            <path d="M12 2v4" />
            <path d="M12 18v4" />
            <path d="M4.93 4.93l2.83 2.83" />
            <path d="M16.24 16.24l2.83 2.83" />
            <path d="M2 12h4" />
            <path d="M18 12h4" />
            <path d="M4.93 19.07l2.83-2.83" />
            <path d="M16.24 7.76l2.83-2.83" />
          </svg>
          Generate Title
        </>
      )}
    </button>
  );
}

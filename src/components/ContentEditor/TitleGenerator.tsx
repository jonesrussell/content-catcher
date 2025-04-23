"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface TitleGeneratorProps {
  content: string;
  onTitleGenerated: (title: string) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export function TitleGenerator({ 
  content, 
  onTitleGenerated, 
  isGenerating,
  setIsGenerating 
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
      className={`absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 
        bg-primary text-white rounded-lg text-sm hover:bg-primary/90 
        transition-all duration-200 flex items-center gap-2
        ${isGenerating ? 'opacity-75 cursor-not-allowed' : 'hover:scale-102'}`}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/100 
            rounded-full animate-spin" />
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

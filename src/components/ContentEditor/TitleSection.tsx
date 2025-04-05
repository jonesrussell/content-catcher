"use client";

import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect, useCallback } from "react";

interface TitleSectionProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  isGeneratingTitle: boolean;
  setIsGeneratingTitle: (loading: boolean) => void;
  disabled?: boolean;
}

export function TitleSection({
  title,
  setTitle,
  content,
  isGeneratingTitle,
  setIsGeneratingTitle,
  disabled
}: TitleSectionProps) {
  const generateTitle = useCallback(async () => {
    if (!content || content.length < 100) return;
    
    setIsGeneratingTitle(true);
    try {
      const response = await axios.post(
        "https://openai.getcreatr.xyz/v1/chat/completions",
        {
          messages: [
            {
              role: "user",
              content: `You are a professional content writer. Generate a concise, engaging, and descriptive title for this content. The title should be between 4-10 words and capture the main theme. Use this json schema: {
                "title": "string"
              }. Content: ${content.slice(0, 1000)}`
            }
          ],
          jsonMode: true
        },
        {
          headers: {
            "x-api-key": "67d49aba0baa5ec70723c474",
            "Content-Type": "application/json",
          },
        }
      );
      
      const jsonContent = response.data?.choices?.[0]?.message?.content;
      if (!jsonContent) throw new Error('Invalid API response');
      
      const parsed = JSON.parse(jsonContent);
      if (!parsed?.title || typeof parsed.title !== 'string') {
        throw new Error('Invalid title format received');
      }
      
      setTitle(parsed.title);
      toast.success("Title generated successfully!");
    } catch (error) {
      console.error("Error generating title:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate title");
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [content, setTitle, setIsGeneratingTitle]);

  useEffect(() => {
    // Auto-generate title when content is long enough and no title exists
    if (content.length >= 100 && !title) {
      generateTitle();
    }
  }, [content, generateTitle, title]);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter or generate a title..."
          className="w-full min-w-0 p-3 md:p-4 text-base md:text-xl font-semibold bg-white/50 backdrop-blur-sm border-2
            border-primary/10 rounded-xl shadow-lg focus:outline-none focus:border-primary/30
            transition-all placeholder:text-primary/40 max-w-full"
          disabled={disabled}
        />
        <button
          onClick={generateTitle}
          className={`absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 
            bg-primary text-white rounded-lg text-sm hover:bg-primary/90 
            transition-all duration-200 flex items-center gap-2
            ${isGeneratingTitle ? 'opacity-75 cursor-not-allowed' : 'hover:scale-102'}`}
          disabled={isGeneratingTitle || disabled}
        >
          {isGeneratingTitle ? (
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
      </motion.div>
    </div>
  );
}

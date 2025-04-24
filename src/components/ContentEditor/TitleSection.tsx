"use client";

import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useEffect, useCallback, useRef } from "react";
import { TitleGenerator } from "./TitleGenerator";

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
  disabled,
}: TitleSectionProps) {
  const hasGeneratedInitialTitle = useRef(false);

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
              }. Content: ${content.slice(0, 1000)}`,
            },
          ],
          jsonMode: true,
        },
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );

      const jsonContent = response.data?.choices?.[0]?.message?.content;
      if (!jsonContent) throw new Error("Invalid API response");

      const parsed = JSON.parse(jsonContent);
      if (!parsed?.title || typeof parsed.title !== "string") {
        throw new Error("Invalid title format received");
      }

      setTitle(parsed.title);
      if (!hasGeneratedInitialTitle.current) {
        hasGeneratedInitialTitle.current = true;
      } else {
        toast.success("Title generated successfully!");
      }
    } catch (error) {
      console.error("Error generating title:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate title",
      );
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [content, setTitle, setIsGeneratingTitle]);

  useEffect(() => {
    // Auto-generate title when content is long enough and no title exists
    if (content.length >= 100 && !title && !hasGeneratedInitialTitle.current) {
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
          className="border-primary/10 focus:border-primary/30 placeholder:text-primary/40 w-full max-w-full min-w-0 rounded-xl border-2 bg-white/50 p-3 text-base font-semibold shadow-lg backdrop-blur-sm transition-all focus:outline-none md:p-4 md:text-xl"
          disabled={disabled}
        />
        <TitleGenerator
          content={content}
          onTitleGenerated={generateTitle}
          isGenerating={isGeneratingTitle}
        />
      </motion.div>
    </div>
  );
}

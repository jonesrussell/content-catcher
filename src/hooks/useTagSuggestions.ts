"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export interface TagSuggestion {
  tag: string;
  confidence: number;
  category: "topic" | "tone" | "structure";
  explanation: string;
}

export function useTagSuggestions(content: string) {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateTags = async () => {
      if (!content || content.length < 50) return;

      setLoading(true);
      try {
        const response = await axios.post(
          "https://openai.getcreatr.xyz/v1/chat/completions",
          {
            messages: [
              {
                role: "user",
                content: `Analyze this content and suggest relevant tags. Consider the subject matter, tone, and structure. Use this json schema: {
                  "suggestions": [
                    {
                      "tag": "string",
                      "confidence": number,
                      "category": "topic" | "tone" | "structure",
                      "explanation": "string"
                    }
                  ]
                }. Provide up to 8 relevant tags. For each tag:
                - Assign a confidence score (0-1)
                - Categorize as either topic, tone, or structure
                - Include a brief explanation of why this tag is relevant
                - Keep tags concise and relevant
                - Ensure tags are useful for content organization
                Content to analyze: ${content}`,
              },
            ],
            jsonMode: true,
          },
          {
            headers: {
              "x-api-key": "67d49aba0baa5ec70723c474",
              "Content-Type": "application/json",
            },
          },
        );

        const jsonContent = JSON.parse(
          response.data.choices[0].message.content,
        );
        setSuggestions(jsonContent.suggestions);
      } catch (error) {
        console.error("Error generating tags:", error);
        toast.error("Failed to generate tag suggestions");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateTags, 1500);
    return () => clearTimeout(debounceTimer);
  }, [content]);

  return { suggestions, loading };
}

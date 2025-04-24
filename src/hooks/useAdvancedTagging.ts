"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export interface TagAnalysis {
  tag: string;
  confidence: number;
  category:
    | "topic"
    | "tone"
    | "structure"
    | "entity"
    | "language"
    | "sentiment";
  source: "ai" | "nlp" | "rules";
  metadata: {
    frequency?: number;
    importance?: number;
    context?: string;
    language?: string;
    sentiment?: number;
  };
  explanation: string;
}

export interface TagStats {
  totalTags: number;
  categoryCounts: Record<string, number>;
  accuracyScore: number;
  languageBreakdown: Record<string, number>;
  topCooccurrences: Array<[string, string, number]>;
}

export function useAdvancedTagging(content: string) {
  const [suggestions, setSuggestions] = useState<TagAnalysis[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<string>("english");

  useEffect(() => {
    const analyzeContent = async () => {
      if (!content || content.length < 50) return;

      setLoading(true);
      try {
        let nlpTags: TagAnalysis[] = [];

        try {
          // Call server-side NLP API
          const nlpResponse = await fetch("/api/nlp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
          });

          if (!nlpResponse.ok) {
            throw new Error("NLP API request failed");
          }

          const nlpData = await nlpResponse.json();
          setLanguage(nlpData.language);
          nlpTags = nlpData.tags;
        } catch (nlpError) {
          console.error("NLP analysis error:", nlpError);
          // Continue with AI analysis even if NLP fails
        }

        // 2. AI Analysis with timeout and retry
        const response = await Promise.race<{
          data: { choices: Array<{ message: { content: string } }> };
        }>([
          axios.post<{ choices: Array<{ message: { content: string } }> }>(
            "https://openai.getcreatr.xyz/v1/chat/completions",
            {
              messages: [
                {
                  role: "user",
                  content: `Analyze this content and provide tag suggestions. Focus on key topics, entities, sentiment, and structure. Use this json schema: {
                    "suggestions": [
                      {
                        "tag": "string",
                        "confidence": number,
                        "category": "topic" | "tone" | "structure" | "entity" | "language" | "sentiment",
                        "source": "ai",
                        "metadata": {
                          "frequency": number,
                          "importance": number,
                          "context": "string",
                          "language": "string",
                          "sentiment": number
                        },
                        "explanation": "string"
                      }
                    ]
                  }. Return ONLY valid JSON, no additional text or explanation. Content to analyze: ${content.slice(0, 1000)}`,
                },
              ],
              model: "gpt-4",
              temperature: 0.7,
              max_tokens: 1000,
              response_format: { type: "json_object" },
            },
            {
              headers: {
                "x-api-key": process.env.NEXT_PUBLIC_OPENAI_API_KEY,
                "Content-Type": "application/json",
              },
            },
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("AI analysis timeout")), 10000),
          ),
        ]);

        const jsonContent = response.data.choices[0].message.content;
        if (!jsonContent) throw new Error("Invalid API response");

        let parsed;
        try {
          parsed = JSON.parse(jsonContent);
        } catch {
          console.error("Failed to parse JSON:", jsonContent);
          throw new Error("Invalid JSON response from API");
        }

        if (!parsed?.suggestions || !Array.isArray(parsed.suggestions)) {
          throw new Error("Invalid suggestions format received");
        }

        const aiTags = parsed.suggestions;

        // Combine and deduplicate tags
        const allTags = [...nlpTags, ...aiTags];
        const uniqueTags = Array.from(
          new Map(allTags.map((tag) => [tag.tag, tag])).values(),
        );

        setSuggestions(uniqueTags);
        setStats(calculateTagStats(uniqueTags));
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error("Failed to analyze content");
      } finally {
        setLoading(false);
      }
    };

    analyzeContent();
  }, [content]);

  const calculateTagStats = (tags: TagAnalysis[]): TagStats => {
    // Implementation of tag stats calculation
    // This is a simplified version - you should implement your actual logic here
    return {
      totalTags: tags.length,
      categoryCounts: {},
      accuracyScore: 0.8,
      languageBreakdown: {},
      topCooccurrences: [],
    };
  };

  return {
    suggestions,
    stats,
    loading,
    language,
  };
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { deduplicateTags, getTopTags } from "@/utils/tags";

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
  uniqueTags: number;
  mostUsedTags: { tag: string; count: number }[];
  averageConfidence: number;
  topTags: string[];
}

interface UseAdvancedTaggingOptions {
  enabled?: boolean;
  onSuggestions?: (suggestions: TagAnalysis[]) => void;
}

interface UseAdvancedTaggingResult {
  suggestions: TagAnalysis[];
  stats: TagStats | null;
  loading: boolean;
  language: string;
  tagSuggestions: string[];
  tagSuggestionsLoading: boolean;
  setTagSuggestions: (tags: string[]) => void;
}

export function useAdvancedTagging(
  content: string,
  options: UseAdvancedTaggingOptions = {}
): UseAdvancedTaggingResult {
  const [suggestions, setSuggestions] = useState<TagAnalysis[]>([]);
  const [stats, setStats] = useState<TagStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<string>("en");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [tagSuggestionsLoading] = useState(false);

  useEffect(() => {
    if (options.enabled && content) {
      const analyzeContent = async () => {
        if (!content || content.length < 50) {
          setSuggestions([]);
          setStats(null);
          setLoading(false);
          return;
        }

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
          let retries = 0;
          const maxRetries = 2;
          const timeoutDuration = 15000; // 15 seconds

          while (retries <= maxRetries) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

              const response = await fetch(
                "https://openai.getcreatr.xyz/v1/chat/completions",
                {
                  method: "POST",
                  headers: new Headers({
                    "x-api-key": process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
                    "Content-Type": "application/json",
                  }),
                  body: JSON.stringify({
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
                  }),
                  signal: controller.signal,
                }
              );

              clearTimeout(timeoutId);

              if (!response.ok) {
                throw new Error("AI analysis failed");
              }

              const data = await response.json();
              const jsonContent = data.choices[0].message.content;
              if (!jsonContent) throw new Error("Invalid API response");

              // Clean the response by removing markdown code block syntax
              const cleanedContent = jsonContent.replace(/```json\n?|\n?```/g, '').trim();
              let parsed;
              try {
                parsed = JSON.parse(cleanedContent);
              } catch {
                console.error("Failed to parse JSON:", cleanedContent);
                throw new Error("Invalid JSON response from API");
              }

              if (!parsed?.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error("Invalid suggestions format received");
              }

              const aiTags = parsed.suggestions;

              // Combine and deduplicate tags using utility functions
              const allTags = [...nlpTags, ...aiTags];
              const uniqueTags = deduplicateTags(allTags);
              const topTags = getTopTags(uniqueTags, 5);

              setSuggestions(topTags);
              setStats(calculateTagStats(topTags));
              options.onSuggestions?.(topTags);
              break; // Success, exit retry loop
            } catch (error) {
              if (retries === maxRetries) {
                throw error; // Throw error if all retries failed
              }
              retries++;
              console.warn(`Retry attempt ${retries} after error:`, error);
              await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
            }
          }
        } catch (error) {
          console.error("Analysis error:", error);
          toast.error("Failed to analyze content");
          setSuggestions([]);
          setStats(null);
        } finally {
          setLoading(false);
        }
      };
      analyzeContent();
    }
  }, [content, options.enabled, options]);

  const calculateTagStats = (tags: TagAnalysis[]): TagStats => {
    const tagCounts = new Map<string, number>();
    let totalConfidence = 0;
    
    tags.forEach(tag => {
      tagCounts.set(tag.tag, (tagCounts.get(tag.tag) || 0) + 1);
      totalConfidence += tag.confidence;
    });

    const sortedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTags: tags.length,
      uniqueTags: tagCounts.size,
      mostUsedTags: sortedTags.slice(0, 5),
      averageConfidence: tags.length > 0 ? totalConfidence / tags.length : 0,
      topTags: sortedTags.slice(0, 10).map(t => t.tag),
    };
  };

  return {
    suggestions,
    stats,
    loading,
    language,
    tagSuggestions,
    tagSuggestionsLoading,
    setTagSuggestions,
  };
}

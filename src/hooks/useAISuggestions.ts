"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface APISuggestion {
  id?: string;
  suggestion: string;
  type?: "structure" | "enhancement" | "summary" | "tone" | "engagement";
  improvedContent?: string;
  explanation?: string;
  analysis?: {
    readability?: {
      score: number;
      level: string;
      improvements: string[];
    };
    tone?: {
      current: string;
      suggested: string;
      reason: string;
    };
    structure?: {
      issues: string[];
      recommendations: string[];
    };
  };
  example?: {
    context: string;
    before: string;
    after: string;
    impact: string;
  };
}

export interface AISuggestion {
  id: string;
  suggestion: string;
  type: "structure" | "enhancement" | "summary" | "tone" | "engagement";
  improvedContent?: string;
  explanation?: string;
  analysis?: {
    readability?: {
      score: number;
      level: string;
      improvements: string[];
    };
    tone?: {
      current: string;
      suggested: string;
      reason: string;
    };
    structure?: {
      issues: string[];
      recommendations: string[];
    };
  };
  example?: {
    context: string;
    before: string;
    after: string;
    impact: string;
  };
}

export function useAISuggestions(content: string) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!content || content.length < 50) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "https://openai.getcreatr.xyz/v1/chat/completions",
          {
            messages: [
              {
                role: "user",
                content: `You are an expert content editor and writing analyst. Analyze this content deeply and provide intelligent suggestions for improvement. Consider tone, structure, clarity, engagement, and emotional impact. Use this json schema: {
                  "suggestions": [
                    {
                      "id": "string",
                      "suggestion": "string",
                      "type": "structure" | "enhancement" | "summary" | "tone" | "engagement",
                      "improvedContent": "string",
                      "explanation": "string",
                      "analysis": {
                        "readability": {
                          "score": number,
                          "level": "string",
                          "improvements": ["string"]
                        },
                        "tone": {
                          "current": "string",
                          "suggested": "string",
                          "reason": "string"
                        },
                        "structure": {
                          "issues": ["string"],
                          "recommendations": ["string"]
                        }
                      },
                      "example": {
                        "before": "string",
                        "after": "string",
                        "context": "string",
                        "impact": "string"
                      }
                    }
                  ]
                }. 
                
                Provide 5 suggestions that cover:
                1. structure: Analyze and improve document organization, flow, and hierarchy
                2. enhancement: Enhance clarity, precision, and impact of key points
                3. tone: Adjust tone for better audience engagement and emotional resonance
                4. engagement: Add elements that increase reader interaction and understanding
                5. summary: Create a concise version while preserving core message and impact

                For each suggestion:
                - Provide detailed analysis of current content strengths and weaknesses
                - Include readability metrics and specific improvement areas
                - Analyze tone and emotional impact
                - Suggest structural improvements with clear reasoning
                - Show before/after examples with explanation of impact
                - Keep core message intact while enhancing delivery`,
              },
              {
                role: "user",
                content: content,
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

        const jsonContent = response.data?.choices?.[0]?.message?.content;
        if (!jsonContent) {
          throw new Error("Invalid API response format");
        }

        // Clean and validate the response
        let cleanedContent = jsonContent;
        
        // Remove markdown code blocks if present
        if (cleanedContent.includes('```')) {
          cleanedContent = cleanedContent.replace(/```json\n?|\n?```/g, '').trim();
        }
        
        // Check if the response is valid JSON
        let parsedContent;
        try {
          parsedContent = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error("Failed to parse API response:", cleanedContent);
          // If the response is not JSON, try to extract JSON from the text
          const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsedContent = JSON.parse(jsonMatch[0]);
            } catch (extractError) {
              console.error("Failed to extract JSON from response:", jsonMatch[0]);
              throw new Error("Could not parse AI response as JSON");
            }
          } else {
            throw new Error("AI response is not in valid JSON format");
          }
        }

        if (!parsedContent?.suggestions || !Array.isArray(parsedContent.suggestions)) {
          throw new Error("Invalid suggestions format received from API");
        }

        // Transform the suggestions into the expected format
        // Limit to 3 suggestions
        const formattedSuggestions = parsedContent.suggestions
          .slice(0, 3)
          .map((s: APISuggestion) => ({
            id: s.id || `suggestion-${Math.random().toString(36).substr(2, 9)}`,
            suggestion: s.suggestion,
            type: s.type || "structure",
            explanation: s.explanation,
            improvedContent: s.improvedContent,
          }));

        setSuggestions(formattedSuggestions);
      } catch (err) {
        setError("Failed to generate suggestions");
        console.error("AI suggestion error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(debounceTimer);
  }, [content]);

  return { suggestions, loading, error, setSuggestions };
}

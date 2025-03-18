"use client";

import { useState, useEffect } from "react";
import { OpenAI } from "openai";

// Initialize OpenAI only on the client side
const getOpenAIClient = () => {
  if (typeof window === 'undefined') return null;
  return new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
};

export interface AISuggestion {
  id: string;
  suggestion: string;
  type: 'structure' | 'enhancement' | 'summary';
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
        const client = getOpenAIClient();
        if (!client) return;
        
        const completion = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that provides suggestions for structuring and improving content. Provide 3 brief, specific suggestions."
            },
            {
              role: "user",
              content: `Analyze this content and provide suggestions for improvement: ${content}`
            }
          ],
          model: "gpt-3.5-turbo",
        });

        const suggestionsText = completion.choices[0]?.message?.content;
        if (suggestionsText) {
          const parsedSuggestions = suggestionsText.split('\n')
            .filter((s: string) => s.trim())
            .map((suggestion: string, index: number) => ({
              id: `suggestion-${index}`,
              suggestion: suggestion.replace(/^\d+\.\s*/, ''),
              type: (index % 3 === 0 ? 'structure' : 
                    index % 3 === 1 ? 'enhancement' : 'summary') as AISuggestion['type']
            }));

          setSuggestions(parsedSuggestions);
        }
      } catch (err) {
        setError('Failed to generate suggestions');
        console.error('AI suggestion error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(debounceTimer);
  }, [content]);

  return { suggestions, loading, error };
}

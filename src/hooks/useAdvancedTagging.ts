"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import * as natural from "natural";
import compromise from "compromise";

export interface TagAnalysis {
  tag: string;
  confidence: number;
  category: 'topic' | 'tone' | 'structure' | 'entity' | 'language' | 'sentiment';
  source: 'ai' | 'nlp' | 'rules';
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
  const [language, setLanguage] = useState<string>('english');

  // Initialize NLP tools
  const tokenizer = new natural.WordTokenizer();
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();

  useEffect(() => {
    const analyzeContent = async () => {
      if (!content || content.length < 50) return;

      setLoading(true);
      try {
        let nlpTags: TagAnalysis[] = [];
        
        try {
          // 1. Local NLP Analysis with error handling
          const tokens = tokenizer.tokenize(content);
          tfidf.addDocument(content);
          const nlp = compromise(content);
          
          // Improved language detection
          try {
            const detectedLang = natural.PorterStemmer.stem(content.slice(0, 100));
            const isEnglish = detectedLang !== content.slice(0, 100);
            setLanguage(isEnglish ? 'english' : 'unknown');
          } catch (langError) {
            console.error("Language detection error:", langError);
            setLanguage('unknown');
          }
          
          // Get entities safely using compromise.js proper methods
          const entities = [
            ...nlp.match('#Organization').out('array'),
            ...nlp.match('#Person').out('array'),
            ...nlp.match('#Place').out('array')
          ].filter(Boolean);
          
          // Generate NLP tags with error handling
          nlpTags = generateNLPTags(tokens, entities);
        } catch (nlpError) {
          console.error("NLP analysis error:", nlpError);
          // Continue with AI analysis even if NLP fails
        }

        // 2. AI Analysis with timeout and retry
        const response = await Promise.race<{data: {choices: Array<{message: {content: string}}>}}>([
          axios.post<{choices: Array<{message: {content: string}}>}>(
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
                  }. Keep suggestions concise and relevant. Content to analyze: ${content.slice(0, 1000)}`
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
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI analysis timeout')), 30000) // Increased timeout to 30 seconds
          )
        ]);

        const jsonContent = response.data?.choices?.[0]?.message?.content;
        if (!jsonContent) {
          throw new Error('Invalid API response format');
        }

        let aiAnalysis;
        try {
          aiAnalysis = JSON.parse(jsonContent);
          if (!Array.isArray(aiAnalysis?.suggestions)) {
            throw new Error('Invalid suggestions format');
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          aiAnalysis = { suggestions: [] };
        }

        // 3. Combine AI and NLP results with validation
        const validatedSuggestions = [
          ...(aiAnalysis.suggestions || []),
          ...nlpTags
        ].filter(suggestion => 
          suggestion && 
          typeof suggestion.tag === 'string' &&
          typeof suggestion.confidence === 'number' &&
          suggestion.confidence >= 0 &&
          suggestion.confidence <= 1
        );

        // 4. Calculate statistics with error handling
        const stats = calculateTagStats(validatedSuggestions);
        
        setSuggestions(validatedSuggestions);
        setStats(stats);
      } catch (error) {
        console.error("Error in advanced tag analysis:", error);
        toast.error(
          error instanceof Error 
            ? `Analysis error: ${error.message}` 
            : "Failed to analyze content for tags"
        );
        
        // Set fallback values
        setSuggestions([]);
        setStats({
          totalTags: 0,
          categoryCounts: {},
          accuracyScore: 0,
          languageBreakdown: {},
          topCooccurrences: []
        });
      } finally {
        setLoading(false);
      }
    };

    // Only analyze if content is long enough
    const debounceTimer = setTimeout(
      () => {
        if (content && content.length >= 50) {
          analyzeContent();
        }
      }, 
      1000
    );
    return () => clearTimeout(debounceTimer);
  }, [content]);

  const generateNLPTags = (tokens: string[], entities: string[]): TagAnalysis[] => {
    const nlpTags: TagAnalysis[] = [];
    
    // Extract entities safely
    entities.forEach((entity: string) => {
      nlpTags.push({
        tag: entity,
        confidence: 0.85,
        category: 'entity',
        source: 'nlp',
        metadata: {
          frequency: 1,
          importance: 0.8,
          context: "Extracted from text analysis"
        },
        explanation: "Entity detected through NLP analysis"
      });
    });

    // Extract key terms using TF-IDF
    const terms = tfidf.listTerms(0).slice(0, 5);
    terms.forEach(term => {
      nlpTags.push({
        tag: term.term,
        confidence: term.tfidf / 10,
        category: 'topic',
        source: 'nlp',
        metadata: {
          frequency: term.tfidf,
          importance: 0.7,
          context: "Identified as key term"
        },
        explanation: "Key term identified through TF-IDF analysis"
      });
    });

    return nlpTags;
  };

  const calculateTagStats = (tags: TagAnalysis[]): TagStats => {
    const categoryCounts: Record<string, number> = {};
    const languageBreakdown: Record<string, number> = {};
    const cooccurrenceMap = new Map<string, Map<string, number>>();

    tags.forEach(tag => {
      // Category counts
      categoryCounts[tag.category] = (categoryCounts[tag.category] || 0) + 1;
      
      // Language breakdown
      if (tag.metadata.language) {
        languageBreakdown[tag.metadata.language] = 
          (languageBreakdown[tag.metadata.language] || 0) + 1;
      }

      // Tag co-occurrences
      tags.forEach(otherTag => {
        if (tag.tag !== otherTag.tag) {
          if (!cooccurrenceMap.has(tag.tag)) {
            cooccurrenceMap.set(tag.tag, new Map());
          }
          const tagMap = cooccurrenceMap.get(tag.tag)!;
          tagMap.set(otherTag.tag, (tagMap.get(otherTag.tag) || 0) + 1);
        }
      });
    });

    // Calculate top co-occurrences
    const topCooccurrences: Array<[string, string, number]> = [];
    cooccurrenceMap.forEach((tagMap, tag1) => {
      tagMap.forEach((count, tag2) => {
        topCooccurrences.push([tag1, tag2, count]);
      });
    });
    topCooccurrences.sort((a, b) => b[2] - a[2]);

    return {
      totalTags: tags.length,
      categoryCounts,
      accuracyScore: calculateAccuracyScore(tags),
      languageBreakdown,
      topCooccurrences: topCooccurrences.slice(0, 5)
    };
  };

  const calculateAccuracyScore = (tags: TagAnalysis[]): number => {
    const confidenceSum = tags.reduce((sum, tag) => sum + tag.confidence, 0);
    return tags.length > 0 ? confidenceSum / tags.length : 0;
  };

  return {
    suggestions,
    stats,
    loading,
    language
  };
}

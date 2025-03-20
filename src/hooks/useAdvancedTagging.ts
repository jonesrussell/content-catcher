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
        // 1. Local NLP Analysis
        const tokens = tokenizer.tokenize(content);
        tfidf.addDocument(content);
        const doc = compromise(content);
        
        // Detect language
        const detectedLang = natural.PorterStemmer.stem(content.slice(0, 100));
        setLanguage(detectedLang === content.slice(0, 100) ? 'unknown' : 'english');

        // 2. AI Analysis
        const response = await axios.post(
          "https://openai.getcreatr.xyz/v1/chat/completions",
          {
            messages: [
              {
                role: "user",
                content: `Analyze this content and provide comprehensive tag suggestions. Consider multiple aspects including topics, entities, sentiment, and structure. Use this json schema: {
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
                  ],
                  "analysis": {
                    "mainTopics": ["string"],
                    "entityTypes": {"person": ["string"], "organization": ["string"], "location": ["string"]},
                    "contentStructure": "string",
                    "languageStyle": "string",
                    "recommendedCategories": ["string"]
                  }
                }. Content to analyze: ${content}`
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

        const aiAnalysis = JSON.parse(response.data.choices[0].message.content);

        // 3. Combine AI and NLP results
        const combinedSuggestions = [
          ...aiAnalysis.suggestions,
          ...generateNLPTags(tokens, doc)
        ];

        // 4. Calculate statistics
        const stats = calculateTagStats(combinedSuggestions);
        
        setSuggestions(combinedSuggestions);
        setStats(stats);
      } catch (error) {
        console.error("Error in advanced tag analysis:", error);
        toast.error("Failed to analyze content for tags");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(analyzeContent, 1000);
    return () => clearTimeout(debounceTimer);
  }, [content]);

  const generateNLPTags = (tokens: string[], doc: any): TagAnalysis[] => {
    const nlpTags: TagAnalysis[] = [];
    
    // Extract entities
    const entities = doc.entities().out('array');
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

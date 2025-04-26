export interface TagAnalysis {
  tag: string;
  confidence: number;
  category?: 'topic' | 'tone' | 'structure' | 'entity' | 'language' | 'sentiment';
  source?: 'ai' | 'nlp' | 'rules' | 'system';
  metadata?: Record<string, unknown>;
  explanation?: string;
}

export interface TagStats {
  totalTags: number;
  uniqueTags: number;
  mostUsedTags: { tag: string; count: number }[];
  averageConfidence: number;
  topTags: string[];
} 
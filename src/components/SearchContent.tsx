"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import debounce from "lodash.debounce";
import { toast } from "react-hot-toast";

import { Content } from "@/hooks/useContent";
import { useTags } from "@/hooks/useTags";
type SearchResult = Content;

export default function SearchContent() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { tags: availableTags } = useTags(user?.id);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, userId: string, tags: string[]) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const query = supabase
          .from("content")
          .select("*")
          .eq("user_id", userId)
          .textSearch("fts", searchQuery, {
            config: "english",
          });

        if (tags.length > 0) {
          query.contains('tags', tags);
        }

        const { data, error } = await query.limit(5);

        if (error) throw error;
        
        // Ensure tags are always an array
        const processedData = (data || []).map(item => ({
          ...item,
          tags: item.tags || [],
          attachments: item.attachments || [],
          version_number: item.version_number || 1
        })) as SearchResult[];

        setResults(processedData);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search content');
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const searchContent = useCallback((searchQuery: string) => {
    if (!user) return;
    debouncedSearch(searchQuery, user.id, selectedTags);
  }, [user, selectedTags, debouncedSearch]);

  useEffect(() => {
    searchContent(query);
  }, [query, selectedTags, searchContent]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-primary/20 rounded px-1">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTags(
                  selectedTags.includes(tag)
                    ? selectedTags.filter(t => t !== tag)
                    : [...selectedTags, tag]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search your content..."
          className="w-full px-4 py-3 pl-12 bg-white/50 backdrop-blur-sm border-2 
            border-primary/10 rounded-xl shadow-sm focus:outline-none 
            focus:border-primary/30 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 
          text-primary/50" />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
            text-primary/50 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl 
              shadow-lg border border-primary/10 overflow-hidden z-50"
          >
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border-b border-primary/5 hover:bg-primary/5 
                    transition-colors cursor-pointer"
                >
                  <p className="text-primary/80 line-clamp-2">
                    {highlightMatch(result.content, query)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

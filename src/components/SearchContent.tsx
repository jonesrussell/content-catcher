"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client'
import { useAuth } from "@/lib/auth-context";
import debounce from "lodash.debounce";
import { toast } from "react-hot-toast";

import type { Content } from "@/types/content";
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

  const supabase = createClient()

  const performSearch = useCallback(
    async (searchQuery: string, userId: string, tags: string[]) => {
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
          query.contains("tags", tags);
        }

        const { data, error } = await query.limit(5);

        if (error) throw error;

        const processedData = (data || []).map((item) => {
          const dbItem = item as unknown as {
            updated_at: string | null;
            archived: boolean | null;
            tags: string[] | null;
            attachments: string[] | null;
            version_number: number | null;
            content: string;
            created_at: string;
            id: string;
            user_id: string;
          };
          return {
            ...item,
            tags: item.tags || [],
            attachments: item.attachments || [],
            version_number: item.version_number || 1,
            updated_at: dbItem.updated_at || item.created_at,
            archived: dbItem.archived || false,
          } as SearchResult;
        });

        setResults(processedData);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search content");
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch],
  );

  const searchContent = useCallback(
    (searchQuery: string) => {
      if (!user) return;
      debouncedSearch(searchQuery, user.id, selectedTags);
    },
    [user, selectedTags, debouncedSearch],
  );

  useEffect(() => {
    searchContent(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, selectedTags, searchContent, debouncedSearch]);

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
      ),
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
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag],
                );
              }}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
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
            className="border-primary/10 focus:border-primary/30 w-full rounded-xl border-2 bg-white/50 px-4 py-3 pl-12 shadow-sm backdrop-blur-sm transition-all focus:outline-none"
          />
          <Search className="text-primary/50 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          {loading && (
            <Loader2 className="text-primary/50 absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 animate-spin" />
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="border-primary/10 absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border bg-white shadow-lg"
            >
              <div className="max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="border-primary/5 hover:bg-primary/5 cursor-pointer border-b p-4 transition-colors"
                  >
                    <p className="text-primary/80 line-clamp-2">
                      {highlightMatch(result.content, query)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
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

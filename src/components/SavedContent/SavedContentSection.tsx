"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { MasonryGrid } from "./MasonryGrid";
import { Loader2 } from "lucide-react";
import type { Content } from "@/hooks/useContent";

export function SavedContentSection() {
  const { user } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    if (!user) {
      setContent([]);
      setLoading(false);
      return;
    }


    const loadContent = async () => {
      try {
        const { data, error } = await supabase
          .from("content")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(page * itemsPerPage, (page + 1) * itemsPerPage - 1);

        if (error) throw error;
        
        const newContent = (data || []).map(item => ({
          ...item,
          tags: item.tags || [],
          attachments: item.attachments || [],
          updated_at: (item as any).updated_at || item.created_at,
          version_number: item.version_number || 1
        }));

        if (page === 0) {
          setContent(newContent);
        } else {
          setContent(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const uniqueNewContent = newContent.filter(item => !existingIds.has(item.id));
            return [...prev, ...uniqueNewContent];
          });
        }
        setHasMore(data.length === itemsPerPage);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();

  }, [user, page]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="mt-8 md:mt-32 py-6 md:py-20 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 border-t-2 border-primary/5 saved-content-section backdrop-blur-sm px-4 md:px-6"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 mb-4">
          Saved Content
        </h2>
        <p className="text-muted-foreground text-lg">
          Your collection of saved thoughts and ideas
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent mx-auto mt-6 rounded-full" />
      </div>

      {loading && page === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-12 text-primary/60">
          No content saved yet
        </div>
      ) : (
        <>
          <MasonryGrid 
            content={content}
            onDelete={(id) => {
              setContent(prev => prev.filter(item => item.id !== id));
            }}
          />

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-6 py-3 bg-white text-primary rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

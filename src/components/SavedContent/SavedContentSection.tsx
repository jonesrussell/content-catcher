"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { MasonryGrid } from "./MasonryGrid";
import { Loader2 } from "lucide-react";
import type { Content } from "@/types/content";
import { EditContentModal } from "../ContentEditor/EditContentModal";
import { useSearchParams } from "next/navigation";

interface DatabaseContent {
  id: string;
  user_id: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string | null;
  version_number: number | null;
  archived: boolean | null;
  attachments: string[] | null;
}

export function SavedContentSection() {
  const { user } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && content.length > 0) {
      const contentToEdit = content.find((item) => item.id === editId);
      if (contentToEdit) {
        setSelectedContent(contentToEdit);
        setIsEditModalOpen(true);
      }
    }
  }, [searchParams, content]);

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

        const newContent = (data || []).map((item) => {
          const dbContent = item as unknown as DatabaseContent;
          return {
            id: dbContent.id,
            user_id: dbContent.user_id,
            content: dbContent.content,
            tags: dbContent.tags || [],
            created_at: dbContent.created_at,
            updated_at: dbContent.updated_at || dbContent.created_at,
            version_number: dbContent.version_number || 1,
            archived: dbContent.archived || false,
            attachments: dbContent.attachments || [],
          } as Content;
        });

        if (page === 0) {
          setContent(newContent);
        } else {
          setContent((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewContent = newContent.filter(
              (item) => !existingIds.has(item.id),
            );
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
        ease: [0.4, 0, 0.2, 1],
      }}
      className="border-primary/5 saved-content-section mt-8 border-t-2 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 px-4 py-6 backdrop-blur-sm md:mt-32 md:px-6 md:py-20"
    >
      <div className="mb-16 text-center">
        <h2 className="from-primary to-primary/70 mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Saved Content
        </h2>
        <p className="text-muted-foreground text-lg">
          Your collection of saved thoughts and ideas
        </p>
        <div className="from-primary/20 via-primary/10 mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r to-transparent" />
      </div>

      {loading && page === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary/50 h-8 w-8 animate-spin" />
        </div>
      ) : content.length === 0 ? (
        <div className="text-primary/60 py-12 text-center">
          No content saved yet
        </div>
      ) : (
        <>
          <MasonryGrid
            content={content}
            onDelete={(id) => {
              setContent((prev) => prev.filter((item) => item.id !== id));
            }}
            onEdit={(content) => {
              setSelectedContent(content);
              setIsEditModalOpen(true);
            }}
          />

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="text-primary rounded-xl bg-white px-6 py-3 shadow-md transition-all hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContent(null);
        }}
        content={selectedContent}
        onContentSaved={() => {
          window.location.reload();
        }}
      />
    </motion.div>
  );
}

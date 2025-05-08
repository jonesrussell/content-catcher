"use client";

import { useState, useEffect, useDeferredValue } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { MasonryGrid } from "./MasonryGrid";
import { Loader2 } from "lucide-react";
import type { Content } from "@/types/content";
import { EditContentModal } from "../ContentEditor/EditContentModal";
import { useSearchParams } from "next/navigation";
import { fetchUserContent } from "@/app/actions/content";

export function SavedContentSection() {
  const { user } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 12;
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const searchParams = useSearchParams();

  // Use deferred value for content to avoid unnecessary re-renders
  const deferredContent = useDeferredValue(content);

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
        const data = await fetchUserContent();
        
        // Handle pagination
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedData = data.slice(start, end);

        if (page === 0) {
          setContent(paginatedData);
        } else {
          setContent((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const uniqueNewContent = paginatedData.filter(
              (item) => !existingIds.has(item.id),
            );
            return [...prev, ...uniqueNewContent];
          });
        }
        setHasMore(paginatedData.length === itemsPerPage);
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [user, page]);

  // Show tags after initial load
  useEffect(() => {
    console.log('Tag visibility effect triggered:', {
      loading,
      contentLength: content.length,
      showTags
    });

    if (!loading && content.length > 0) {
      console.log('Content loaded, checking for AI tags:', {
        contentItems: content.map(item => ({
          id: item.id,
          contentLength: item.content.length,
          hasTags: item.tags && item.tags.length > 0,
          tags: item.tags
        }))
      });

      const timer = setTimeout(() => {
        // Only show tags for content that has AI-generated tags
        const hasAIGeneratedTags = content.some(item => {
          const shouldShow = item.content.length >= 100 && 
            item.tags && 
            item.tags.length > 0;
          
          console.log('Checking item for AI tags:', {
            id: item.id,
            contentLength: item.content.length,
            hasTags: item.tags && item.tags.length > 0,
            shouldShow
          });
          
          return shouldShow;
        });

        console.log('Setting showTags to:', hasAIGeneratedTags);
        setShowTags(hasAIGeneratedTags);
      }, 1000); // Show tags after 1 second
      return () => clearTimeout(timer);
    }
  }, [loading, content, showTags]);

  // Add debug log for render
  console.log('SavedContentSection render:', {
    loading,
    contentLength: content.length,
    showTags,
    hasMore
  });

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h2 className="text-primary text-2xl font-bold">Your Content</h2>
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
            content={deferredContent}
            onDelete={(id) => {
              setContent((prev) => prev.filter((item) => item.id !== id));
            }}
            onEdit={(content) => {
              setSelectedContent(content);
              setIsEditModalOpen(true);
            }}
            showTags={showTags}
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

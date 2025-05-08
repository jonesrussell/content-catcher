"use client";

import { useState, useEffect, useDeferredValue, useTransition } from "react";
import { useAuth } from "@/lib/auth-context";
import { MasonryGrid } from "./MasonryGrid";
import { Loader2 } from "lucide-react";
import type { Content } from "@/types/content";
import { EditContentModal } from "../ContentEditor/EditContentModal";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      console.log('No user found, redirecting to login');
      startTransition(() => {
        router.replace('/login');
      });
      return;
    }

    const loadContent = async () => {
      try {
        console.log('Loading content for user:', user.id);
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
        if (error instanceof Error && error.message === 'Not authenticated') {
          console.log('Authentication error, redirecting to login');
          startTransition(() => {
            router.replace('/login');
          });
          return;
        }
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [user, page, router]);

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

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Saved Content</h2>
        <button
          onClick={() => setShowTags(!showTags)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {showTags ? "Hide Tags" : "Show Tags"}
        </button>
      </div>

      {deferredContent.length === 0 ? (
        <div className="text-center text-gray-500">
          No content saved yet. Start by creating some content!
        </div>
      ) : (
        <MasonryGrid
          content={deferredContent}
          onEdit={(content) => {
            setSelectedContent(content);
            setIsEditModalOpen(true);
          }}
          onDelete={(id) => {
            setContent((prev) => prev.filter((item) => item.id !== id));
          }}
          showTags={showTags}
        />
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="text-gray-600 hover:text-gray-900"
            disabled={isPending}
          >
            Load More
          </button>
        </div>
      )}

      {selectedContent && (
        <EditContentModal
          content={selectedContent}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedContent(null);
          }}
        />
      )}
    </div>
  );
}

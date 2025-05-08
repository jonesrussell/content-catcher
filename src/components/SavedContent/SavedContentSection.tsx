"use client";

import { useState, useEffect, useDeferredValue, useTransition } from "react";
import { MasonryGrid } from "./MasonryGrid";
import { Loader2 } from "lucide-react";
import type { Content } from "@/types/content";
import { EditContentModal } from "../ContentEditor/EditContentModal";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchUserContent } from "@/app/actions/content";

export function SavedContentSection() {
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
  const [, startTransition] = useTransition();

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
    const loadContent = async () => {
      try {
        console.log("Loading content...");
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
        if (error instanceof Error && error.message === "Not authenticated") {
          console.log("Authentication error, redirecting to login");
          startTransition(() => {
            router.replace("/login");
          });
          return;
        }
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [page, router]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading && page === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!loading && content.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No content saved yet</p>
      </div>
    );
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

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Load More"
            )}
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

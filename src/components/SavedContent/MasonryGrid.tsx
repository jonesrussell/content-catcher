"use client";

import { motion } from "framer-motion";
import { Archive, ArrowUpCircle, Trash2, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Content } from "@/types/content";
import { Button } from "../ui/button";
import { cleanTag } from "@/utils/tags";
import { updateContent, deleteContent } from "@/app/actions/content";
import { useOptimistic } from "react";

interface MasonryGridProps {
  content: Content[];
  onDelete: (id: string) => void;
  onEdit: (content: Content) => void;
  showTags: boolean;
}

export function MasonryGrid({ content, onDelete, onEdit, showTags }: MasonryGridProps) {
  // Use optimistic updates for content
  const [optimisticContent, setOptimisticContent] = useOptimistic(content);

  // Add debug log for render
  console.log('MasonryGrid render:', {
    contentLength: content.length,
    showTags,
    itemsWithTags: content.map(item => ({
      id: item.id,
      contentLength: item.content.length,
      hasTags: item.tags && item.tags.length > 0,
      tags: item.tags
    }))
  });

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {optimisticContent.map((item) => {
        const shouldShowItemTags = showTags && 
          item.content.length >= 100 && 
          item.tags && 
          item.tags.length > 0;

        console.log('Rendering item:', {
          id: item.id,
          contentLength: item.content.length,
          hasTags: item.tags && item.tags.length > 0,
          showTags,
          shouldShowItemTags
        });

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`group saved-content-item border-primary/5 relative mb-8 rounded-xl border bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
              item.archived ? "opacity-60" : ""
            }`}
            tabIndex={0}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
                className="rounded-full p-2 hover:bg-primary/5"
                title="Edit"
              >
                <Pencil className="h-4 w-4 text-primary/70" />
              </Button>
              <button
                onClick={async () => {
                  try {
                    setOptimisticContent(prev => 
                      prev.map(c => c.id === item.id ? { ...c, archived: !c.archived } : c)
                    );
                    
                    await updateContent(item.id, { archived: !item.archived });
                    toast.success(
                      item.archived ? "Content restored" : "Content archived",
                    );
                  } catch {
                    toast.error("Failed to archive content");
                    setOptimisticContent(content); // Revert on error
                  }
                }}
                className="hover:bg-primary/5 rounded-full p-2 transition-colors"
                title={item.archived ? "Restore" : "Archive"}
              >
                {item.archived ? (
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <ArrowUpCircle className="text-primary/70 h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Archive className="text-primary/70 h-5 w-5" />
                  </motion.div>
                )}
              </button>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this content?")) {
                    try {
                      setOptimisticContent(prev => 
                        prev.filter(c => c.id !== item.id)
                      );
                      
                      await deleteContent(item.id);
                      onDelete(item.id);
                      toast.success("Content deleted");
                    } catch {
                      toast.error("Failed to delete content");
                      setOptimisticContent(content); // Revert on error
                    }
                  }
                }}
                className="rounded-full p-2 transition-colors hover:bg-red-50"
                title="Delete"
              >
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Trash2 className="h-5 w-5 text-red-500/70" />
                </motion.div>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-primary/80 whitespace-pre-wrap text-base leading-relaxed">
                {item.content}
              </p>
              {shouldShowItemTags && (
                <div className="flex flex-wrap gap-2">
                  {item.tags?.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                    >
                      {cleanTag(tag)}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-primary/60 flex items-center justify-between text-xs">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

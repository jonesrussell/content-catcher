"use client";

import Masonry from "react-masonry-css";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import type { Content } from "@/hooks/useContent";

interface MasonryGridProps {
  content: Content[];
  onDelete: (id: string) => void;
}

export function MasonryGrid({ content, onDelete }: MasonryGridProps) {
  const breakpointCols = {
    default: 3,
    1920: 3,
    1536: 2,
    1280: 2,
    1024: 2,
    768: 1,
    640: 1,
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("content").delete().eq("id", id);

      if (error) throw error;
      onDelete(id);
      toast.success("Content deleted successfully");
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="-ml-2 flex w-auto md:-ml-8"
      columnClassName="pl-2 md:pl-8 bg-clip-padding"
      style={{ display: "flex" }}
    >
      <AnimatePresence>
        {content.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="group saved-content-item border-primary/5 relative mb-8 rounded-xl border bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            style={{
              opacity: 1,
              transform: "scale(1)",
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-full bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-primary/80 line-clamp-4 text-base leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary/5 text-primary/70 rounded-full px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-primary/60 flex items-center justify-between text-xs">
                <span>
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {item.attachments && item.attachments.length > 0 && (
                  <span>{item.attachments.length} attachments</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </Masonry>
  );
}

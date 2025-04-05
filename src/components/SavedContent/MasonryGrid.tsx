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
    640: 1
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

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
      className="flex -ml-2 md:-ml-8 w-auto"
      columnClassName="pl-2 md:pl-8 bg-clip-padding"
      style={{ display: 'flex' }}
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
            className="mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative group saved-content-item border border-primary/5"
            style={{
              opacity: 1,
              transform: 'scale(1)'
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-primary/80 line-clamp-4 whitespace-pre-wrap text-base leading-relaxed">
                {item.content}
              </p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/5 text-primary/70 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-primary/60">
                <span>
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
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

"use client";

import { motion } from "framer-motion";
import { Archive, ArrowUpCircle, Trash2, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import type { Content, ContentUpdate } from "@/hooks/useContent";
import { Button } from "../ui/button";

interface MasonryGridProps {
  content: Content[];
  onDelete: (id: string) => void;
  onEdit: (content: Content) => void;
}

export function MasonryGrid({ content, onDelete, onEdit }: MasonryGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {content.map((item) => (
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
                  const update: ContentUpdate = {
                    archived: !item.archived,
                    updated_at: new Date().toISOString(),
                  };
                  await supabase
                    .from("content")
                    .update(update)
                    .eq("id", item.id);
                  toast.success(
                    item.archived ? "Content restored" : "Content archived",
                  );
                  window.location.reload();
                } catch {
                  toast.error("Failed to archive content");
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
                    await supabase.from("content").delete().eq("id", item.id);
                    onDelete(item.id);
                    toast.success("Content deleted");
                  } catch {
                    toast.error("Failed to delete content");
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
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-primary/60 flex items-center justify-between text-xs">
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

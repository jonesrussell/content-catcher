"use client";

import { motion } from "framer-motion";
import { Archive, ArrowUpCircle, Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import type { Content, ContentUpdate } from "@/hooks/useContent";

interface ContentListProps {
  content: Content[];
  onEditContent: (content: Content) => void;
}

export default function ContentList({ content, onEditContent }: ContentListProps) {
  return (
    <div className="space-y-6">
      {content.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-6 bg-white rounded-xl shadow-md relative ${
            item.archived ? 'opacity-60' : ''
          }`}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const update: ContentUpdate = {
                    archived: !item.archived,
                    updated_at: new Date().toISOString()
                  };
                  await supabase
                    .from('content')
                    .update(update)
                    .eq('id', item.id);
                  toast.success(item.archived ? 'Content restored' : 'Content archived');
                  window.location.reload();
                } catch (error) {
                  toast.error('Failed to archive content');
                }
              }}
              className="p-2 hover:bg-primary/5 rounded-full transition-colors"
              title={item.archived ? 'Restore' : 'Archive'}
            >
              {item.archived ? (
                <motion.div whileHover={{ scale: 1.1 }}>
                  <ArrowUpCircle className="w-5 h-5 text-primary/70" />
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Archive className="w-5 h-5 text-primary/70" />
                </motion.div>
              )}
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this content?')) {
                  try {
                    await supabase
                      .from('content')
                      .delete()
                      .eq('id', item.id);
                    toast.success('Content deleted');
                    window.location.reload();
                  } catch (error) {
                    toast.error('Failed to delete content');
                  }
                }
              }}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
              title="Delete"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Trash2 className="w-5 h-5 text-red-500/70" />
              </motion.div>
            </button>
            <button
              onClick={() => onEditContent(item)}
              className="p-2 hover:bg-primary/5 rounded-full transition-colors"
              title="Edit"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Edit className="w-5 h-5 text-primary/70" />
              </motion.div>
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-primary/80 whitespace-pre-wrap">
              {item.content}
            </p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {item.attachments && item.attachments.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Attachments: {item.attachments.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {item.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline text-sm"
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </motion.div>
      ))}
      {content.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No content saved yet
        </p>
      )}
    </div>
  );
}

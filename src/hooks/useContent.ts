"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Content } from "@/types/content";
import { toast } from "react-hot-toast";

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

export interface ContentVersion {
  id: string;
  content_id: string;
  content: string;
  attachments: string[];
  tags: string[];
  version_number: number;
  created_at: string;
  comment?: string;
}

export interface ContentUpdate {
  content?: string;
  attachments?: string[];
  tags?: string[];
  archived?: boolean;
  updated_at?: string;
}

export function useContent(userId?: string) {
  const supabase = createClient();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("content")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mappedContent = (data || []).map((item) => {
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

        setContent(mappedContent);
      } catch (error) {
        console.error("Error loading content:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    }

    loadContent();

    // Set up real-time subscription
    const channel = supabase
      .channel("content_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("Change received!", payload);

          switch (payload.eventType) {
            case "INSERT":
              setContent((prev) => [payload.new as Content, ...prev]);
              toast.success("New content added!");
              break;

            case "UPDATE":
              setContent((prev) =>
                prev.map((item) =>
                  item.id === payload.new.id
                    ? ({
                        ...payload.new,
                        tags: payload.new.tags || [],
                      } as Content)
                    : item,
                ),
              );
              toast.success("Content updated!");
              break;

            case "DELETE":
              setContent((prev) =>
                prev.filter((item) => item.id !== payload.old.id),
              );
              toast.success("Content deleted!");
              break;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return { content, loading };
}

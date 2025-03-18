"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export interface Content {
  id: string;
  content: string;
  created_at: string;
  attachments: string[];
  tags: string[];
  user_id: string;
  fts?: unknown;
}

export function useContent(userId: string | undefined) {
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
        
        // Ensure tags are always an array
        const processedData = (data || []).map(item => ({
          ...item,
          tags: item.tags || []
        })) as Content[];
        
        setContent(processedData);
      } catch (error) {
        console.error("Error loading content:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [userId]);

  return { content, loading };
}

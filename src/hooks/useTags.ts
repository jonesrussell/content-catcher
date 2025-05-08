"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client'

export function useTags(userId: string | undefined) {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient()

  useEffect(() => {
    async function fetchTags() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("content")
          .select("tags")
          .eq("user_id", userId);

        if (error) throw error;

        const uniqueTags = Array.from(
          new Set(data?.flatMap((item) => item.tags || []) || []),
        );
        setTags(uniqueTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, [userId]);

  return { tags, loading };
}

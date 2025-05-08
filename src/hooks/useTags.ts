"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client'

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('tags')
          .not('tags', 'is', null)

        if (error) throw error

        // Extract unique tags from all content
        const uniqueTags = Array.from(
          new Set(data.flatMap((item) => item.tags || []))
        ).sort()

        setTags(uniqueTags)
      } catch (error) {
        console.error('Error fetching tags:', error)
        setTags([])
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [supabase])

  return { tags, loading }
}

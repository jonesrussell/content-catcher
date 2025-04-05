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
  archived?: boolean;
  updated_at?: string;
  version_number: number;
  parent_version_id?: string | null;
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

    // Set up real-time subscription
    const channel = supabase
      .channel('content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Change received!', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              setContent(prev => [payload.new as Content, ...prev]);
              toast.success('New content added!');
              break;
              
            case 'UPDATE':
              setContent(prev => 
                prev.map(item => 
                  item.id === payload.new.id ? 
                  { ...payload.new, tags: payload.new.tags || [] } as Content : 
                  item
                )
              );
              toast.success('Content updated!');
              break;
              
            case 'DELETE':
              setContent(prev => 
                prev.filter(item => item.id !== payload.old.id)
              );
              toast.success('Content deleted!');
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { content, loading };
}

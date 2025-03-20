"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import type { Content, ContentVersion } from "./useContent";

export function useContentVersions(contentId: string | undefined) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVersions() {
      if (!contentId) return;

      try {
        const { data, error } = await supabase
          .from('content_versions')
          .select(`
            id,
            content_id,
            content,
            attachments,
            tags,
            version_number,
            created_at,
            comment
          `)
          .eq("content_id", contentId)
          .order("version_number", { ascending: false });

        if (error) throw error;
        setVersions(data.map(version => ({
          id: version.id,
          content_id: version.content_id,
          content: version.content,
          attachments: version.attachments || [],
          tags: version.tags || [],
          version_number: version.version_number,
          created_at: version.created_at,
          comment: version.comment
        })));
      } catch (error) {
        console.error("Error loading versions:", error);
        toast.error("Failed to load content versions");
      } finally {
        setLoading(false);
      }
    }

    loadVersions();
  }, [contentId]);

  const createVersion = async (content: Content, comment?: string) => {
    try {
      const { error } = await supabase.from('content_versions').insert({
        content_id: content.id,
        user_id: content.user_id,
        content: content.content,
        attachments: content.attachments,
        tags: content.tags,
        version_number: content.version_number,
        comment
      });

      if (error) throw error;
      toast.success("Version saved successfully");
    } catch (error) {
      console.error("Error creating version:", error);
      toast.error("Failed to save version");
      throw error;
    }
  };

  const revertToVersion = async (version: ContentVersion) => {
    try {
      const { error } = await supabase
        .from("content")
        .update({
          content: version.content,
          attachments: version.attachments,
          tags: version.tags,
          version_number: version.version_number + 1,
          updated_at: new Date().toISOString()
        })
        .eq("id", version.content_id);

      if (error) throw error;
      toast.success("Reverted to previous version");
    } catch (error) {
      console.error("Error reverting version:", error);
      toast.error("Failed to revert version");
      throw error;
    }
  };

  return {
    versions,
    loading,
    createVersion,
    revertToVersion
  };
}

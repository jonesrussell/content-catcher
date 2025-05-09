"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ContentEditor from "@/components/ContentEditor";
import { SavedContentSection } from "@/components/SavedContent/SavedContentSection";
import type { Content } from "@/types/content";
import { Toaster } from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchContents() {
      if (!user) return;

      const { data } = await createClient()
        .from("content")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const mappedContent = data.map((item) => ({
          id: item.id,
          title: item.title || "",
          content: item.content,
          tags: item.tags || [],
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_id: item.user_id,
          version_number: item.version_number || 1,
          archived: item.archived || false,
          attachments: item.attachments || [],
          parent_version_id: item.parent_version_id || null,
          fts: item.fts || null,
        }));
        setContents(mappedContent);
      }
      setIsLoading(false);
    }

    fetchContents();
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        {contents.length > 0 && (
          <ContentEditor
            contentId={contents[0].id}
            initialContent={contents[0].content}
            initialTags={contents[0].tags}
          />
        )}
        <SavedContentSection />
      </div>
      <Toaster />
    </main>
  );
}

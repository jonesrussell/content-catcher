"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ContentEditor from "@/components/ContentEditor";
import { SavedContentSection } from "@/components/SavedContentSection";
import type { Content } from "@/types/content";
import { Toaster } from "react-hot-toast";
import { createClient } from '@/utils/supabase/client';

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
      
      const supabase = createClient();
      const { data } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });
      
      setContents(data || []);
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
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <ContentEditor initialContent={contents[0]} />
        <SavedContentSection initialContents={contents} />
      </div>
      <Toaster />
    </main>
  );
}

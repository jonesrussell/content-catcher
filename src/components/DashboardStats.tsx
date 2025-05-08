"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";
import type { Database } from "@/lib/supabase.types";

type Stats = {
  totalContent: number;
  totalVersions: number;
  totalTags: number;
  averageContentLength: number;
};

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data: content } = await supabase
          .from("content")
          .select("*")
          .eq("user_id", session.user.id);

        const { data: versions } = await supabase
          .from("content_versions")
          .select("*")
          .eq("user_id", session.user.id);

        if (!content) return;

        const totalContent = content.length;
        const totalVersions = versions?.length || 0;
        const totalTags = content.reduce(
          (acc, item) => acc + (item.tags?.length || 0),
          0,
        );
        const averageContentLength =
          content.reduce((acc, item) => acc + item.content.length, 0) /
          totalContent;

        setStats({
          totalContent,
          totalVersions,
          totalTags,
          averageContentLength,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Content</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {stats.totalContent}
        </p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Versions</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {stats.totalVersions.toLocaleString()}
        </p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Tags</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {stats.totalTags.toLocaleString()}
        </p>
      </div>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-sm font-medium text-gray-500">
          Avg. Content Length
        </h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {Math.round(stats.averageContentLength)}
        </p>
      </div>
    </div>
  );
}

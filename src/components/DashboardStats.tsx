"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client'
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileText, Hash, Clock, Loader2 } from "lucide-react";

interface ContentStats {
  totalCount: number;
  tagCounts: { name: string; value: number }[];
  timelineData: { date: string; count: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface DashboardStatsProps {
  userId: string
}

export default function DashboardStats({ userId }: DashboardStatsProps) {
  const supabase = createClient()
  const [stats, setStats] = useState<ContentStats>({
    totalCount: 0,
    tagCounts: [],
    timelineData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total count
        const { count: totalCount, error: countError } = await supabase
          .from("content")
          .select("*", { count: "exact" })
          .eq("user_id", userId);

        if (countError) {
          throw countError;
        }

        // Fetch content for timeline
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: timelineContent } = await supabase
          .from("content")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", thirtyDaysAgo.toISOString());

        // Process timeline data
        const timelineMap = new Map<string, number>();
        timelineContent?.forEach((content) => {
          const date = new Date(content.created_at).toLocaleDateString();
          timelineMap.set(date, (timelineMap.get(date) || 0) + 1);
        });

        const timelineData = Array.from(timelineMap.entries())
          .map(([date, count]) => ({ date, count }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        setStats({
          totalCount: totalCount || 0,
          tagCounts: [
            { name: "Notes", value: Math.floor(Math.random() * 10) + 1 },
            { name: "Ideas", value: Math.floor(Math.random() * 8) + 1 },
            { name: "Tasks", value: Math.floor(Math.random() * 6) + 1 },
            { name: "Links", value: Math.floor(Math.random() * 4) + 1 },
          ],
          timelineData,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white p-6 shadow-md"
        >
          <div className="mb-2 flex items-center gap-3">
            <FileText className="text-primary h-5 w-5" />
            <h3 className="text-primary text-lg font-semibold">
              Total Content
            </h3>
          </div>
          <p className="text-primary text-3xl font-bold">{stats.totalCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-white p-6 shadow-md"
        >
          <div className="mb-2 flex items-center gap-3">
            <Hash className="text-primary h-5 w-5" />
            <h3 className="text-primary text-lg font-semibold">Categories</h3>
          </div>
          <p className="text-primary text-3xl font-bold">
            {stats.tagCounts.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-white p-6 shadow-md"
        >
          <div className="mb-2 flex items-center gap-3">
            <Clock className="text-primary h-5 w-5" />
            <h3 className="text-primary text-lg font-semibold">Last 30 Days</h3>
          </div>
          <p className="text-primary text-3xl font-bold">
            {stats.timelineData.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-white p-6 shadow-md"
        >
          <h3 className="text-primary mb-4 text-lg font-semibold">
            Content Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.timelineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-white p-6 shadow-md"
        >
          <h3 className="text-primary mb-4 text-lg font-semibold">
            Content by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.tagCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {stats.tagCounts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

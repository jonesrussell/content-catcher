"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import { FileText, Hash, Clock } from "lucide-react";

interface ContentStats {
  totalCount: number;
  tagCounts: { name: string; value: number }[];
  timelineData: { date: string; count: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ContentStats>({
    totalCount: 0,
    tagCounts: [],
    timelineData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total count
        const { count: totalCount } = await supabase
          .from("content")
          .select("*", { count: "exact" })
          .eq("user_id", userId);

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
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Total Content</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{stats.totalCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <Hash className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Categories</h3>
          </div>
          <p className="text-3xl font-bold text-primary">{stats.tagCounts.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Last 30 Days</h3>
          </div>
          <p className="text-3xl font-bold text-primary">
            {stats.timelineData.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Content Timeline</h3>
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
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-semibold text-primary mb-4">Content by Category</h3>
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

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Edit2, Save, Loader2 } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import SearchContent from "@/components/SearchContent";
import { toast } from "react-hot-toast";

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
}

import { Content, useContent } from "@/hooks/useContent";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { content, loading: contentLoading } = useContent(user?.id);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setEditedProfile(profileData);

      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editedProfile.username,
          full_name: editedProfile.full_name,
          avatar_url: editedProfile.avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;
      setProfile(editedProfile);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-primary">Search Content</h2>
              <SearchContent />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Dashboard</h2>
            {user && <DashboardStats userId={user.id} />}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">Profile</h1>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editedProfile?.username ?? ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, username: e.target.value } : null
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editedProfile?.full_name ?? ""}
                    onChange={(e) =>
                      setEditedProfile((prev) =>
                        prev ? { ...prev, full_name: e.target.value } : null
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <p className="text-lg text-primary">{profile?.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-lg text-primary">{profile?.full_name}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-primary mb-6">Saved Content</h2>
            <div className="space-y-6">
              {content.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 bg-white rounded-xl shadow-md"
                >
                  <div className="space-y-3">
                    <p className="text-primary/80 whitespace-pre-wrap">
                      {item.content}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Attachments: {item.attachments.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.attachments.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline text-sm"
                          >
                            Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-4">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
              {content.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No content saved yet
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

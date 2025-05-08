"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Edit2, Save, Loader2 } from "lucide-react";
import { ContentList } from "@/components/ContentList";
import DashboardStats from "@/components/DashboardStats";
import SearchContent from "@/components/SearchContent";
import { toast } from "react-hot-toast";
import { useContent } from "@/hooks/useContent";
import { updateProfile } from "@/app/actions/profile";

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  id: string;
  updated_at: string | null;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}

export default function ProfileContent() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { content } = useContent(profile?.id);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create it
          if (profileError.code === "PGRST116") {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                username: user.email?.split("@")[0] || null,
                full_name: null,
                avatar_url: null,
              })
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
            setEditedProfile(newProfile);
            setFormData({
              username: newProfile.username || "",
              full_name: newProfile.full_name || "",
              avatar_url: newProfile.avatar_url || "",
            });
          } else {
            throw profileError;
          }
        } else {
          setProfile(profileData);
          setEditedProfile(profileData);
          setFormData({
            username: profileData.username || "",
            full_name: profileData.full_name || "",
            avatar_url: profileData.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      setSaving(true);
      const result = await updateProfile({
        ...editedProfile,
        ...formData,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setProfile({
        ...editedProfile,
        ...formData,
      });
      setEditing(false);
      setError(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-8 rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-6">
            <h2 className="text-primary text-2xl font-bold">Search Content</h2>
            <SearchContent />
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-primary mb-6 text-2xl font-bold">Dashboard</h2>
          {profile && <DashboardStats userId={profile.id} />}
        </div>

        <div className="mb-8 rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-primary text-3xl font-bold">Profile</h1>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-primary hover:bg-primary/5 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-primary mb-2 block text-sm font-medium">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="border-input bg-background focus:ring-primary/20 w-full rounded-lg border px-4 py-2 transition-all focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-primary mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="border-input bg-background focus:ring-primary/20 w-full rounded-lg border px-4 py-2 transition-all focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-primary mb-2 block text-sm font-medium">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar_url: e.target.value })
                  }
                  className="border-input bg-background focus:ring-primary/20 w-full rounded-lg border px-4 py-2 transition-all focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground block text-sm font-medium">
                  Username
                </label>
                <p className="text-primary text-lg">{profile?.username}</p>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-medium">
                  Full Name
                </label>
                <p className="text-primary text-lg">{profile?.full_name}</p>
              </div>
              <div>
                <label className="text-muted-foreground block text-sm font-medium">
                  Avatar URL
                </label>
                <p className="text-primary text-lg">{profile?.avatar_url}</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-primary mb-6 text-2xl font-bold">
            Saved Content
          </h2>
          <ContentList contents={content} />
        </div>
      </motion.div>
    </div>
  );
}

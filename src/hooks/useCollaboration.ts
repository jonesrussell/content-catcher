"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import type { User } from "@supabase/supabase-js";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface CollaboratorPresence {
  user_id: string;
  username: string | null;
  last_active: string;
  cursor_position: number | null;
  selection_start: number | null;
  selection_end: number | null;
}

interface PresenceState {
  [key: string]: Array<{
    user_id: string;
    username: string | null;
    last_active: string;
    cursor_position: number | null;
    selection_start: number | null;
    selection_end: number | null;
  }>;
}

export function useCollaboration(contentId: string, user: User | null) {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>(
    [],
  );
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!contentId || !user) return;

    // Subscribe to real-time presence updates
    const channel = supabase
      .channel(`content:${contentId}`)
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState() as PresenceState;
        const currentCollaborators = Object.values(presenceState)
          .flat()
          .map((p) => ({
            user_id: p.user_id,
            username: p.username,
            last_active: p.last_active,
            cursor_position: p.cursor_position,
            selection_start: p.selection_start,
            selection_end: p.selection_end,
          }));
        setCollaborators(currentCollaborators);
      })
      .on("broadcast", { event: "content_update" }, ({ payload }) => {
        // Handle content updates from other users
        if (payload.user_id !== user.id) {
          toast.success(`${payload.username || "Someone"} made changes`);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            username: user.email?.split("@")[0],
            last_active: new Date().toISOString(),
            cursor_position: null,
            selection_start: null,
            selection_end: null,
          });
        }
      });

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [contentId, user]);

  const updatePresence = async (
    cursorPosition: number | null = null,
    selectionStart: number | null = null,
    selectionEnd: number | null = null,
  ) => {
    if (!channel) return;

    await channel.track({
      user_id: user?.id,
      username: user?.email?.split("@")[0],
      last_active: new Date().toISOString(),
      cursor_position: cursorPosition,
      selection_start: selectionStart,
      selection_end: selectionEnd,
    });
  };

  const broadcastContentUpdate = async (content: string) => {
    if (!channel || !user) return;

    await channel.send({
      type: "broadcast",
      event: "content_update",
      payload: {
        user_id: user.id,
        username: user.email?.split("@")[0],
        content,
      },
    });
  };

  return {
    collaborators,
    updatePresence,
    broadcastContentUpdate,
  };
}

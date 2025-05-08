"use client";

import { User } from "lucide-react";

interface CollaboratorIndicatorsProps {
  collaborators: Array<{
    user_id: string;
    username: string | null;
    last_active: string;
    cursor_position: number | null;
  }>;
  currentUserId: string;
}

export function CollaboratorIndicators({
  collaborators,
  currentUserId,
}: CollaboratorIndicatorsProps) {
  const otherCollaborators = collaborators.filter(
    (c) => c.user_id !== currentUserId,
  );

  if (otherCollaborators.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      {otherCollaborators.map((collaborator) => (
        <div
          key={collaborator.user_id}
          className="bg-primary/10 flex items-center gap-2 rounded-full px-3 py-1.5"
        >
          <User className="text-primary/70 h-4 w-4" />
          <span className="text-primary/70 text-sm">
            {collaborator.username || "Anonymous"}
          </span>
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      ))}
    </div>
  );
}

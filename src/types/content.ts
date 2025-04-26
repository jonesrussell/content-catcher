export interface Content {
  id: string;
  user_id: string;
  content: string;
  title?: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  version_number: number | null;
  archived: boolean;
  attachments: string[] | null;
  fts?: unknown;
  parent_version_id: string | null;
} 
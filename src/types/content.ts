export interface Content {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  attachments?: string[];
  version_number?: number;
  archived?: boolean;
  parent_version_id?: string | null;
  fts?: Record<string, unknown> | null;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  content: string;
  created_at: string;
  tags: string[];
  version_number: number;
  comment?: string;
} 
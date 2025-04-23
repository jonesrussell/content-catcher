export interface Content {
  id: string;
  content: string;
  created_at: string;
  attachments: string[];
  tags: string[];
  user_id: string;
  fts?: unknown;
  archived?: boolean;
  updated_at?: string;
  version_number: number;
  parent_version_id?: string | null;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  content: string;
  attachments: string[];
  tags: string[];
  version_number: number;
  created_at: string;
  comment?: string;
} 
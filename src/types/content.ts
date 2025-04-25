export interface Content {
  id: string;
  user_id: string;
  content: string;
  title?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  version_number: number;
  archived: boolean;
  attachments: string[];
} 
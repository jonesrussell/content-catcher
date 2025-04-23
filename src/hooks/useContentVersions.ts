import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { Content, ContentVersion } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VersionComparison {
  changes: Array<{
    type: 'add' | 'remove' | 'modify';
    content: string;
    lineNumber: number;
  }>;
  additions: string[];
  deletions: string[];
}

export const useContentVersions = (contentId: string) => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersions = async () => {
      if (!contentId) return;

      try {
        const { data, error } = await supabase
          .from('content_versions')
          .select('*')
          .eq('content_id', contentId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setVersions(data.map(version => ({
          ...version,
          created_at: new Date(version.created_at).toISOString()
        })));
      } catch (error) {
        console.error('Error loading versions:', error);
        toast.error('Failed to load content versions');
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, [contentId]);

  const createVersion = async (content: Content, comment?: string) => {
    try {
      // First, update the content
      const { error: contentError } = await supabase
        .from('contents')
        .update({
          content: content.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (contentError) throw contentError;

      // Then, create a new version
      const { error: versionError } = await supabase.from('content_versions').insert({
        content_id: content.id,
        content: content.content,
        comment,
        version_number: versions.length + 1,
        created_at: new Date().toISOString()
      });

      if (versionError) throw versionError;

      toast.success('Version saved successfully');
      return true;
    } catch (error) {
      console.error('Error creating version:', error);
      toast.error('Failed to save version');
      return false;
    }
  };

  const compareVersions = async (versionA: ContentVersion, versionB: ContentVersion): Promise<VersionComparison> => {
    // Implementation for comparing versions
    return {
      changes: [],
      additions: [],
      deletions: []
    };
  };

  const revertToVersion = async (version: ContentVersion) => {
    try {
      const { error } = await supabase
        .from('contents')
        .update({
          content: version.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', version.content_id);

      if (error) throw error;

      toast.success('Reverted to previous version');
      return true;
    } catch (error) {
      console.error('Error reverting version:', error);
      toast.error('Failed to revert version');
      return false;
    }
  };

  return {
    versions,
    loading,
    createVersion,
    compareVersions,
    revertToVersion
  };
};

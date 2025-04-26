import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Content } from '@/types/content';
import { useAuth } from './auth-context';

interface ContentContextType {
  contents: Content[];
  loading: boolean;
  error: Error | null;
  fetchContents: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchContents = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        updated_at: item.created_at,
        archived: false,
      })) as Content[];
      
      setContents(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contents'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return (
    <ContentContext.Provider value={{ contents, loading, error, fetchContents }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
} 
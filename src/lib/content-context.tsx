'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Content } from '@/types/content'

interface ContentContextType {
  content: Content[]
  loading: boolean
  error: string | null
  refreshContent: () => Promise<void>
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const refreshContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match the Content type
      const transformedData = (data || []).map(item => ({
        ...item,
        updated_at: item.created_at,
        archived: false,
      })) as Content[]

      setContent(transformedData)
    } catch (err) {
      console.error('Error fetching content:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        error,
        refreshContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
} 
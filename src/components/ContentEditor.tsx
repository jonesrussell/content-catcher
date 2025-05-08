"use client";

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ContentEditorProps {
  contentId?: string
  initialContent?: string
  initialTags?: string[]
}

export default function ContentEditor({
  contentId,
  initialContent = '',
  initialTags = [],
}: ContentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        if (!response.ok) {
          throw new Error('Failed to fetch tags')
        }
        const data = await response.json()
        setTagSuggestions(data.tags)
      } catch (err) {
        console.error('Error fetching tags:', err)
      }
    }

    fetchTags()
  }, [])

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setError('Content cannot be empty')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/content', {
        method: contentId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contentId,
          content,
          tags,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save content')
      }

      const result = await response.json()
      toast.success('Content saved successfully')
      if (!contentId) {
        router.push(`/dashboard?edit=${result.id}`)
      }
    } catch (err) {
      console.error('Error saving content:', err)
      setError(err instanceof Error ? err.message : 'Failed to save content')
      toast.error('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }, [content, tags, contentId, router])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const autoSave = async () => {
      if (content.trim() && !isSaving) {
        setIsAutoSaving(true)
        try {
          await handleSave()
        } catch (err) {
          console.error('Auto-save failed:', err)
        } finally {
          setIsAutoSaving(false)
        }
      }
    }

    if (content.trim()) {
      timeoutId = setTimeout(autoSave, 5000)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [content, handleSave, isSaving])

  const handleTagAdd = (tag: string) => {
    if (!tag.trim()) return
    if (tags.includes(tag)) return
    setTags([...tags, tag])
    setNewTag('')
  }

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {isAutoSaving && (
          <div className="absolute bottom-4 right-4">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTagAdd(newTag)
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => handleTagAdd(newTag)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        {tagSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagSuggestions
              .filter((tag) => !tags.includes(tag))
              .map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagAdd(tag)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200"
                >
                  {tag}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || !content.trim()}
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  )
}

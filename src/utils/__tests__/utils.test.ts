import { describe, it, expect } from 'vitest'
import { formatDate, truncateText } from '../utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      expect(formatDate(date)).toBe('Jan 1, 2024')
    })

    it('handles invalid date', () => {
      expect(formatDate('invalid')).toBe('Invalid Date')
    })
  })

  describe('truncateText', () => {
    it('truncates text to specified length', () => {
      const text = 'This is a long text that needs to be truncated'
      expect(truncateText(text, 10)).toBe('This is a...')
    })

    it('returns original text if shorter than max length', () => {
      const text = 'Short text'
      expect(truncateText(text, 20)).toBe(text)
    })

    it('handles empty string', () => {
      expect(truncateText('', 10)).toBe('')
    })
  })
}) 
import { TagAnalysis } from "@/hooks/useAdvancedTagging";

export const MAX_TAG_LENGTH = 50;
export const MIN_TAG_LENGTH = 2;

export function cleanTag(tag: string): string {
  // Remove HTML tags
  let cleaned = tag.replace(/<[^>]*>/g, ' ').trim();
  // Remove special characters except hyphens and underscores
  cleaned = cleaned.replace(/[^a-zA-Z0-9\s-_]/g, '');
  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, ' ');
  // Convert to lowercase
  cleaned = cleaned.toLowerCase();
  // Trim to max length
  cleaned = cleaned.slice(0, MAX_TAG_LENGTH);
  return cleaned;
}

export function validateTag(tag: string): boolean {
  const cleaned = cleanTag(tag);
  return cleaned.length >= MIN_TAG_LENGTH && cleaned.length <= MAX_TAG_LENGTH;
}

export function deduplicateTags(tags: TagAnalysis[]): TagAnalysis[] {
  const uniqueTags = new Map<string, TagAnalysis>();
  
  tags.forEach(tag => {
    const cleanedTag = cleanTag(tag.tag);
    if (validateTag(cleanedTag)) {
      // If tag exists, keep the one with higher confidence
      if (!uniqueTags.has(cleanedTag) || uniqueTags.get(cleanedTag)!.confidence < tag.confidence) {
        uniqueTags.set(cleanedTag, {
          ...tag,
          tag: cleanedTag
        });
      }
    }
  });

  return Array.from(uniqueTags.values());
}

export function sortTagsByConfidence(tags: TagAnalysis[]): TagAnalysis[] {
  return [...tags].sort((a, b) => b.confidence - a.confidence);
}

export function getTopTags(tags: TagAnalysis[], limit: number = 5): TagAnalysis[] {
  return sortTagsByConfidence(tags).slice(0, limit);
}

export function shouldShowTags(content: string, tags: string[] | null): boolean {
  return content.length >= 100 && tags !== null && tags.length > 0;
} 
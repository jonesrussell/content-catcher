"use client";

import { useCallback } from "react";
import type { TagAnalysis } from "@/hooks/useAdvancedTagging";

export function useTagSuggestionsManager(
  setTagSuggestions: ((suggestions: TagAnalysis[]) => void) | undefined,
) {
  return useCallback(
    (suggestions: TagAnalysis[]) => {
      if (typeof setTagSuggestions === "function") {
        setTagSuggestions(suggestions);
      }
    },
    [setTagSuggestions],
  );
}

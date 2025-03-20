"use client";

import { useState, useCallback } from 'react';

interface HistoryState {
  content: string;
  timestamp: number;
}

export function useContentHistory(initialContent: string = '') {
  const [history, setHistory] = useState<HistoryState[]>([
    { content: initialContent, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushContent = useCallback((newContent: string) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({
      content: newContent,
      timestamp: Date.now()
    });
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1].content;
    }
    return history[currentIndex].content;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1].content;
    }
    return history[currentIndex].content;
  }, [canRedo, currentIndex, history]);

  return {
    currentContent: history[currentIndex].content,
    pushContent,
    undo,
    redo,
    canUndo,
    canRedo
  };
}

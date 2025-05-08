"use client";

import { X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { SuggestionItem } from "./SuggestionItem";

interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  loading: boolean;
  onClose: () => void;
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function AISuggestionsPanel({
  suggestions,
  loading,
  onClose,
  onApplySuggestion,
  textareaRef,
}: AISuggestionsPanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="border-primary/20 fixed top-24 right-8 z-50 w-80 rounded-xl border bg-white/95 p-4 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary flex items-center gap-2 text-base font-semibold">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          AI Suggestions
        </h3>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="border-primary h-4 w-4 rounded-full border-b-2"></div>
          )}
          <button
            onClick={onClose}
            className="hover:bg-primary/5 rounded-full p-1.5"
          >
            <X className="text-primary/70 h-4 w-4" />
          </button>
        </div>
      </div>

      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination || !textareaRef.current) return;

          const suggestion = suggestions.find(
            (s) => s.id === result.draggableId,
          );
          if (!suggestion) return;

          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;

          const newContent =
            text.substring(0, start) +
            suggestion.suggestion +
            text.substring(end);

          onApplySuggestion(newContent);
          toast.success("Suggestion applied!");

          // Set cursor position after the inserted text
          const newCursorPosition = start + suggestion.suggestion.length;
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
          }, 0);
        }}
      >
        <Droppable droppableId="suggestions">
          {(provided) => (
            <div
              className="space-y-3"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {suggestions.map((suggestion, index) => (
                <Draggable
                  key={suggestion.id}
                  draggableId={suggestion.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <SuggestionItem
                      suggestion={suggestion}
                      onApply={(content) => {
                        if (!content) {
                          toast.error("No improved content available");
                          return;
                        }
                        onApplySuggestion(content);
                        toast.success("Content updated with suggestion!");
                      }}
                      provided={provided}
                      snapshot={snapshot}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

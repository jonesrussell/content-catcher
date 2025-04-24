"use client";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import type { AISuggestion } from "@/hooks/useAISuggestions";

interface SuggestionsPanelProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function SuggestionsPanel({
  suggestions,
  onApplySuggestion,
  textareaRef,
}: SuggestionsPanelProps) {
  return (
    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination || !textareaRef.current) return;

        const suggestion = suggestions.find((s) => s.id === result.draggableId);
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

        const newCursorPosition = start + suggestion.suggestion.length;
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
      }}
    >
      <Droppable
        droppableId="suggestions"
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
        type="suggestion"
      >
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
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group flex cursor-pointer items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm transition-all hover:bg-white hover:shadow-md ${
                      snapshot.isDragging ? "scale-105 shadow-xl" : ""
                    }`}
                    onClick={() => {
                      if (!suggestion.improvedContent) {
                        toast.error("No improved content available");
                        return;
                      }
                      onApplySuggestion(suggestion.improvedContent);
                      toast.success("Content updated with suggestion!");
                    }}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        suggestion.type === "structure"
                          ? "bg-blue-500"
                          : suggestion.type === "enhancement"
                            ? "bg-green-500"
                            : suggestion.type === "tone"
                              ? "bg-yellow-500"
                              : suggestion.type === "engagement"
                                ? "bg-pink-500"
                                : "bg-purple-500"
                      }`}
                    />

                    <p className="text-primary/80 truncate text-sm">
                      {suggestion.suggestion}
                    </p>

                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="text-primary/70 absolute bottom-full left-4 z-10 mb-2 w-64 rounded-lg bg-white p-3 text-xs shadow-lg">
                        {suggestion.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

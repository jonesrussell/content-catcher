"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { ReadabilityMeter } from "./ReadabilityMeter";
import { ToneAnalysis } from "./ToneAnalysis";
import { ExampleSection } from "./ExampleSection";

interface AIPanelProps {
  suggestions: AISuggestion[];
  loading: boolean;
  onClose: () => void;
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function AIPanel({
  suggestions,
  loading,
  onClose,
  onApplySuggestion,
  textareaRef,
}: AIPanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="border-primary/20 fixed top-24 right-8 z-50 w-80 rounded-xl border bg-white/95 p-4 shadow-xl backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-primary flex items-center gap-2 text-base font-semibold">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          AI Suggestions
        </h3>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
          )}
          <button
            onClick={onClose}
            className="hover:bg-primary/5 rounded-full p-1.5 transition-colors"
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
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transform cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-all ${snapshot.isDragging ? "scale-105 shadow-xl" : "hover:bg-primary/5 hover:shadow-md"} group relative`}
                      onClick={() => {
                        if (!suggestion.improvedContent) {
                          toast.error("No improved content available");
                          return;
                        }
                        onApplySuggestion(suggestion.improvedContent);
                        toast.success("Content updated with suggestion!");
                      }}
                    >
                      <div className="flex flex-wrap items-start gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            suggestion.type === "structure"
                              ? "bg-blue-100 text-blue-700"
                              : suggestion.type === "enhancement"
                                ? "bg-green-100 text-green-700"
                                : suggestion.type === "tone"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : suggestion.type === "engagement"
                                    ? "bg-pink-100 text-pink-700"
                                    : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {suggestion.type}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-primary/80 text-sm">
                          {suggestion.suggestion}
                        </p>
                        {suggestion.explanation && (
                          <p className="text-primary/60 text-xs italic">
                            {suggestion.explanation}
                          </p>
                        )}
                        {suggestion.analysis && (
                          <div className="mt-4 space-y-3">
                            <div className="bg-primary/5 rounded-lg p-3">
                              <h4 className="text-primary mb-2 text-sm font-medium">
                                Content Analysis
                              </h4>
                              <ReadabilityMeter
                                analysis={suggestion.analysis}
                              />
                              <ToneAnalysis analysis={suggestion.analysis} />
                            </div>
                            <ExampleSection example={suggestion.example} />
                          </div>
                        )}
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
    </motion.div>
  );
}

"use client";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import type { AISuggestion } from "@/hooks/useAISuggestions";
import { ReadabilityMeter } from "../AIPanel/ReadabilityMeter";
import { ToneAnalysis } from "../AIPanel/ToneAnalysis";
import { ExampleSection } from "../AIPanel/ExampleSection";

interface SuggestionsPanelProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function SuggestionsPanel({
  suggestions,
  onApplySuggestion,
  textareaRef
}: SuggestionsPanelProps) {
  return (
    <DragDropContext
      onDragEnd={(result) => {
        if (!result.destination || !textareaRef.current) return;
        
        const suggestion = suggestions.find(s => s.id === result.draggableId);
        if (!suggestion) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        const newContent = text.substring(0, start) + 
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
                    className={`px-4 py-2 bg-white/90 rounded-full shadow-sm 
                      transition-all cursor-pointer hover:shadow-md hover:bg-white
                      flex items-center gap-3 group ${
                        snapshot.isDragging ? 'shadow-xl scale-105' : ''
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
                    <span className={`w-2 h-2 rounded-full ${
                      suggestion.type === 'structure' ? 'bg-blue-500' :
                      suggestion.type === 'enhancement' ? 'bg-green-500' :
                      suggestion.type === 'tone' ? 'bg-yellow-500' :
                      suggestion.type === 'engagement' ? 'bg-pink-500' :
                      'bg-purple-500'
                    }`} />
                      
                    <p className="text-sm text-primary/80 truncate">
                      {suggestion.suggestion}
                    </p>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute left-4 bottom-full mb-2 p-3 bg-white rounded-lg shadow-lg 
                        w-64 z-10 text-xs text-primary/70">
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

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
                    className={`p-4 bg-white rounded-lg shadow-sm 
                      transition-all cursor-pointer transform
                      ${snapshot.isDragging ? 'shadow-xl scale-105' : 'hover:shadow-md hover:bg-primary/5'}
                      group relative`}
                    onClick={() => {
                      if (!suggestion.improvedContent) {
                        toast.error("No improved content available");
                        return;
                      }
                      onApplySuggestion(suggestion.improvedContent);
                      toast.success("Content updated with suggestion!");
                    }}
                  >
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.type === 'structure' ? 'bg-blue-100 text-blue-700' :
                        suggestion.type === 'enhancement' ? 'bg-green-100 text-green-700' :
                        suggestion.type === 'tone' ? 'bg-yellow-100 text-yellow-700' :
                        suggestion.type === 'engagement' ? 'bg-pink-100 text-pink-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {suggestion.type}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-primary/80">
                        {suggestion.suggestion}
                      </p>
                      {suggestion.explanation && (
                        <p className="text-xs text-primary/60 italic">
                          {suggestion.explanation}
                        </p>
                      )}
                      {suggestion.analysis && (
                        <div className="mt-4 space-y-3">
                          <div className="p-3 bg-primary/5 rounded-lg">
                            <h4 className="text-sm font-medium text-primary mb-2">
                              Content Analysis
                            </h4>
                            <ReadabilityMeter analysis={suggestion.analysis} />
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
  );
}

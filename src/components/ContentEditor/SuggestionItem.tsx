"use client";

import type { AISuggestion } from "@/hooks/useAISuggestions";
import type { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";
import { ReadabilityMeter } from "../AIPanel/ReadabilityMeter";
import { ToneAnalysis } from "../AIPanel/ToneAnalysis";
import { ExampleSection } from "../AIPanel/ExampleSection";

interface SuggestionItemProps {
  suggestion: AISuggestion;
  onApply: (content: string) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

export function SuggestionItem({
  suggestion,
  onApply,
  provided,
  snapshot
}: SuggestionItemProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`p-4 bg-white rounded-lg shadow-sm 
        transition-all cursor-pointer transform
        ${snapshot.isDragging ? 'shadow-xl scale-105' : 'hover:shadow-md hover:bg-primary/5'}
        group relative`}
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
        {suggestion.analysis?.readability && (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
            Readability: {suggestion.analysis.readability.score}/100
          </span>
        )}
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
              <h4 className="text-sm font-medium text-primary mb-2">Content Analysis</h4>
              <ReadabilityMeter analysis={suggestion.analysis} />
              <ToneAnalysis analysis={suggestion.analysis} />
            </div>
            <ExampleSection example={suggestion.example} />
          </div>
        )}
      </div>
    </div>
  );
}

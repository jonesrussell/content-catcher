"use client";

import type { AISuggestion } from "@/hooks/useAISuggestions";
import type {
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
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
  snapshot,
}: SuggestionItemProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`transform cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-all ${snapshot.isDragging ? "scale-105 shadow-xl" : "hover:bg-primary/5 hover:shadow-md"} group relative`}
      onClick={() => {
        if (!suggestion.improvedContent) return;
        onApply(suggestion.improvedContent);
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
        {suggestion.analysis?.readability && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
            Readability: {suggestion.analysis.readability.score}/100
          </span>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-primary/80 text-sm">{suggestion.suggestion}</p>
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

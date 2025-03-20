"use client";

interface ToneAnalysisProps {
  analysis: {
    tone?: {
      current: string;
      suggested: string;
      reason: string;
    };
  };
}

export function ToneAnalysis({ analysis }: ToneAnalysisProps) {
  if (!analysis.tone) return null;

  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-primary/70">Tone Analysis</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-primary/60">
          {analysis.tone.current} → {analysis.tone.suggested}
        </span>
      </div>
      <p className="text-xs text-primary/70 mt-1">
        {analysis.tone.reason}
      </p>
    </div>
  );
}

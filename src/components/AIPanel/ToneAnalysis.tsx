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
      <p className="text-primary/70 text-xs font-medium">Tone Analysis</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-primary/60 text-xs">
          {analysis.tone.current} → {analysis.tone.suggested}
        </span>
      </div>
      <p className="text-primary/70 mt-1 text-xs">{analysis.tone.reason}</p>
    </div>
  );
}

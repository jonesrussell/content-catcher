"use client";

interface ReadabilityMeterProps {
  analysis: {
    readability?: {
      score: number;
      level: string;
      improvements: string[];
    };
  };
}

export function ReadabilityMeter({ analysis }: ReadabilityMeterProps) {
  if (!analysis.readability) return null;

  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-primary/70">Readability</p>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${analysis.readability.score}%` }}
          />
        </div>
        <span className="text-xs text-primary/60">
          {analysis.readability.level}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {analysis.readability.improvements.map((improvement, i) => (
          <li key={i} className="text-xs text-primary/70 flex items-start gap-2">
            <span className="text-primary/40">•</span>
            {improvement}
          </li>
        ))}
      </ul>
    </div>
  );
}

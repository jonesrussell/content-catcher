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
      <p className="text-primary/70 text-xs font-medium">Readability</p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-2 flex-grow overflow-hidden rounded-full bg-gray-200">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${analysis.readability.score}%` }}
          />
        </div>
        <span className="text-primary/60 text-xs">
          {analysis.readability.level}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {analysis.readability.improvements.map((improvement, i) => (
          <li
            key={i}
            className="text-primary/70 flex items-start gap-2 text-xs"
          >
            <span className="text-primary/40">•</span>
            {improvement}
          </li>
        ))}
      </ul>
    </div>
  );
}

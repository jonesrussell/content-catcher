"use client";

interface ExampleSectionProps {
  example?: {
    context: string;
    before: string;
    after: string;
    impact: string;
  };
}

export function ExampleSection({ example }: ExampleSectionProps) {
  if (!example) return null;

  return (
    <div className="p-3 bg-primary/5 rounded-lg">
      <p className="text-xs font-medium text-primary mb-2">
        Example: {example.context}
      </p>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-primary/60">Before:</p>
          <p className="text-xs text-primary/80 pl-2 border-l-2 border-red-300">
            {example.before}
          </p>
        </div>
        <div>
          <p className="text-xs text-primary/60">After:</p>
          <p className="text-xs text-primary/80 pl-2 border-l-2 border-green-300">
            {example.after}
          </p>
        </div>
        <p className="text-xs text-primary/60 mt-2 italic">
          Impact: {example.impact}
        </p>
      </div>
    </div>
  );
}

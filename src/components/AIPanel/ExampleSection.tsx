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
    <div className="bg-primary/5 rounded-lg p-3">
      <p className="text-primary mb-2 text-xs font-medium">
        Example: {example.context}
      </p>
      <div className="space-y-2">
        <div>
          <p className="text-primary/60 text-xs">Before:</p>
          <p className="text-primary/80 border-l-2 border-red-300 pl-2 text-xs">
            {example.before}
          </p>
        </div>
        <div>
          <p className="text-primary/60 text-xs">After:</p>
          <p className="text-primary/80 border-l-2 border-green-300 pl-2 text-xs">
            {example.after}
          </p>
        </div>
        <p className="text-primary/60 mt-2 text-xs italic">
          Impact: {example.impact}
        </p>
      </div>
    </div>
  );
}

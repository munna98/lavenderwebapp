"use client";

import { useState } from "react";

type Props = {
  notes: string;
  maxChars?: number;
};

export default function ExpandableNotes({ notes, maxChars = 130 }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = notes.split("\n").filter((l) => l.trim().length > 0);
  const isLong = notes.length > maxChars || lines.length > 2;

  if (!isLong) {
    return <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "var(--foreground)" }}>{notes}</p>;
  }

  const displayText = isExpanded ? notes : lines.slice(0, 2).join("\n");

  return (
    <div className="space-y-1">
      <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "var(--foreground)" }}>
        {displayText}
        {!isExpanded && " ..."}
      </p>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-semibold cursor-pointer transition-colors hover:underline inline-block mt-0.5"
        style={{ color: "var(--accent)" }}
      >
        {isExpanded ? "show less" : "more..."}
      </button>
    </div>
  );
}

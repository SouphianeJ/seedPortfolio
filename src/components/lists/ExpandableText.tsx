"use client";

import { useMemo, useState } from "react";

interface ExpandableTextProps {
  text: string;
  maxSentences?: number;
  className?: string;
  textClassName?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

const sentenceChunks = (text: string) => {
  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  const sentenceEndRegex = /([.!?…]+[\]\)\}"'»“”’]*)(\s+|$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = sentenceEndRegex.exec(text)) !== null) {
    const endIndex = match.index + match[0].length;
    chunks.push(text.slice(lastIndex, endIndex));
    lastIndex = endIndex;
  }

  if (lastIndex < text.length) {
    chunks.push(text.slice(lastIndex));
  }

  return chunks.length > 0 ? chunks : [text];
};

const computePreview = (text: string, maxSentences: number) => {
  const sentences = sentenceChunks(text);
  if (sentences.length <= maxSentences) {
    return { preview: text, isTruncated: false };
  }

  const preview = sentences.slice(0, maxSentences).join("");
  return {
    preview,
    isTruncated: true,
  };
};

export const ExpandableText = ({
  text,
  maxSentences = 2,
  className = "",
  textClassName = "",
  expandLabel = "plus de détails ...",
  collapseLabel = "Masquer les détails",
}: ExpandableTextProps) => {
  const { preview, isTruncated } = useMemo(
    () => computePreview(text, maxSentences),
    [text, maxSentences],
  );
  const [expanded, setExpanded] = useState(false);

  const containerClasses = ["space-y-1", className].filter(Boolean).join(" ");
  const paragraphClasses = ["whitespace-pre-line", textClassName]
    .filter(Boolean)
    .join(" ");

  const content = expanded || !isTruncated ? text : preview;

  return (
    <div className={containerClasses}>
      <p className={paragraphClasses}>{content}</p>
      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-xs font-medium text-sky-400 transition hover:text-sky-300"
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;

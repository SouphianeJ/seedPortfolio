"use client";

import { useMemo, useState } from "react";

interface ExpandableTextProps {
  text?: string | null;
  previewSentenceCount?: number;
  className?: string;
}

const SENTENCE_END_REGEX = /[.!?…]+(?=\s|$)/g;
const FALLBACK_CHARACTER_LIMIT = 180;

const isWhitespace = (character: string | undefined) =>
  character !== undefined && /\s/.test(character);

const trimTrailingPunctuation = (value: string) =>
  value.replace(/[\-–—,:;]+$/u, "").trimEnd();

const computeFallbackPreview = (text: string) => {
  if (text.length <= FALLBACK_CHARACTER_LIMIT) {
    return { preview: text, truncated: false } as const;
  }

  let endIndex = FALLBACK_CHARACTER_LIMIT;

  while (endIndex > 0 && !isWhitespace(text[endIndex - 1])) {
    endIndex -= 1;
  }

  if (endIndex === 0) {
    endIndex = FALLBACK_CHARACTER_LIMIT;
  }

  let preview = text.slice(0, endIndex);

  if (isWhitespace(text[endIndex])) {
    preview = preview.trimEnd();
  }

  preview = trimTrailingPunctuation(preview);

  if (!preview) {
    preview = trimTrailingPunctuation(text.slice(0, FALLBACK_CHARACTER_LIMIT));
  }

  return {
    preview,
    truncated: true,
  } as const;
};

const computePreview = (text: string, previewSentenceCount: number) => {
  if (previewSentenceCount <= 0) {
    return { preview: text, truncated: false };
  }

  let match: RegExpExecArray | null;
  let sentencesFound = 0;
  let endIndex = text.length;

  while ((match = SENTENCE_END_REGEX.exec(text)) !== null) {
    sentencesFound += 1;
    if (sentencesFound === previewSentenceCount) {
      endIndex = match.index + match[0].length;
      break;
    }
  }

  const truncated = endIndex < text.length;

  if (!truncated) {
    return computeFallbackPreview(text);
  }

  // Include trailing whitespace up to the first newline to avoid clipping paragraphs awkwardly.
  while (endIndex < text.length && text[endIndex] === " ") {
    endIndex += 1;
  }

  const previewText = text.slice(0, endIndex);
  const fallbackResult = computeFallbackPreview(previewText);

  return {
    preview: fallbackResult.preview,
    truncated: true,
  };
};

export const ExpandableText = ({
  text,
  previewSentenceCount = 3,
  className,
}: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false);

  const { preview, truncated } = useMemo(() => {
    if (!text) {
      return { preview: "", truncated: false };
    }

    return computePreview(text, previewSentenceCount);
  }, [text, previewSentenceCount]);

  if (!text) {
    return null;
  }

  const paragraphClassName = ["whitespace-pre-line", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <p className={paragraphClassName}>{expanded || !truncated ? text : preview}</p>
      {!expanded && truncated && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-xs font-medium text-sky-400 transition hover:text-sky-300"
        >
          plus de détails ...
        </button>
      )}
    </div>
  );
};

export default ExpandableText;

import type { RangeTuple } from "fuse.js";

/** A segment of text that may or may not be highlighted */
export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Split text into highlighted and non-highlighted segments based on Fuse.js match indices.
 *
 * Fuse.js indices are [start, end] pairs where end is inclusive.
 * The returned segments cover the entire text without gaps or overlaps.
 */
export function splitByIndices(
  text: string,
  indices: ReadonlyArray<RangeTuple>,
): HighlightSegment[] {
  if (indices.length === 0) {
    return [{ text, highlighted: false }];
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const [start, end] of indices) {
    // Add non-highlighted text before this match
    if (cursor < start) {
      segments.push({ text: text.slice(cursor, start), highlighted: false });
    }

    // Add highlighted match (end is inclusive, so +1)
    segments.push({ text: text.slice(start, end + 1), highlighted: true });
    cursor = end + 1;
  }

  // Add any remaining non-highlighted text after the last match
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments;
}

interface HighlightedTextProps {
  text: string;
  indices: ReadonlyArray<RangeTuple>;
  className?: string;
}

/**
 * Render text with highlighted segments wrapped in <mark> elements.
 *
 * Uses the HTML5 <mark> element which is semantically correct for
 * search result highlighting and is properly handled by screen readers.
 */
export function HighlightedText({
  text,
  indices,
  className,
}: HighlightedTextProps) {
  if (!indices || indices.length === 0) {
    return <>{text}</>;
  }

  const segments = splitByIndices(text, indices);

  return (
    <>
      {segments.map((segment, i) =>
        segment.highlighted ? (
          <mark key={i} className={className}>
            {segment.text}
          </mark>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}

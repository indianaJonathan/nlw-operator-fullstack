import { diffLines } from "diff";

type SplitDiffSide = {
  lineNumber: number | null;
  code: string;
  type: "added" | "removed" | "context" | "empty";
};

type SplitDiffRow = {
  left: SplitDiffSide;
  right: SplitDiffSide;
};

const emptySide: SplitDiffSide = {
  lineNumber: null,
  code: "",
  type: "empty",
};

/**
 * Generates a side-by-side (split) diff between original and suggested code.
 * Uses the `diff` library for accurate LCS-based line diffing.
 *
 * Returns an array of rows, each with a left (original) and right (suggested)
 * side. Context lines appear on both sides. Removed lines appear only on the
 * left with an empty right. Added lines appear only on the right with an
 * empty left.
 */
function generateSplitDiff(
  originalCode: string,
  suggestedCode: string,
): SplitDiffRow[] {
  const changes = diffLines(originalCode, suggestedCode);
  const rows: SplitDiffRow[] = [];

  let leftLineNum = 1;
  let rightLineNum = 1;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];
    const lines = change.value.replace(/\n$/, "").split("\n");

    if (!change.added && !change.removed) {
      // Context: both sides get the line
      for (const line of lines) {
        rows.push({
          left: {
            lineNumber: leftLineNum++,
            code: line,
            type: "context",
          },
          right: {
            lineNumber: rightLineNum++,
            code: line,
            type: "context",
          },
        });
      }
      i++;
    } else if (change.removed) {
      const removedLines = lines;
      // Check if the next change is "added" (paired removal + addition)
      const next = changes[i + 1];
      if (next?.added) {
        const addedLines = next.value.replace(/\n$/, "").split("\n");
        const maxLen = Math.max(removedLines.length, addedLines.length);

        for (let j = 0; j < maxLen; j++) {
          const hasLeft = j < removedLines.length;
          const hasRight = j < addedLines.length;

          rows.push({
            left: hasLeft
              ? {
                  lineNumber: leftLineNum++,
                  code: removedLines[j],
                  type: "removed",
                }
              : { ...emptySide },
            right: hasRight
              ? {
                  lineNumber: rightLineNum++,
                  code: addedLines[j],
                  type: "added",
                }
              : { ...emptySide },
          });
        }
        i += 2; // Skip both removed and added
      } else {
        // Only removed, no matching addition
        for (const line of removedLines) {
          rows.push({
            left: {
              lineNumber: leftLineNum++,
              code: line,
              type: "removed",
            },
            right: { ...emptySide },
          });
        }
        i++;
      }
    } else if (change.added) {
      // Only added, no matching removal (standalone addition)
      for (const line of lines) {
        rows.push({
          left: { ...emptySide },
          right: {
            lineNumber: rightLineNum++,
            code: line,
            type: "added",
          },
        });
      }
      i++;
    } else {
      i++;
    }
  }

  return rows;
}

export { generateSplitDiff, type SplitDiffRow, type SplitDiffSide };

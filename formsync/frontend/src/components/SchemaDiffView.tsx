/**
 * SchemaDiffView — before/after diff of a JSON schema
 *
 * Computes a line-level diff between two JSON strings and renders
 * added / removed / unchanged lines with git-style colouring.
 * No external diff library required.
 */

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  GitCompare,
  Plus,
  Minus,
  Equal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type LineKind = "added" | "removed" | "unchanged";

interface DiffLine {
  kind: LineKind;
  lineNum: { before: number | null; after: number | null };
  content: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Very lightweight LCS-based diff for arrays of strings. */
function computeDiff(beforeLines: string[], afterLines: string[]): DiffLine[] {
  const m = beforeLines.length;
  const n = afterLines.length;

  // Build LCS table (only two rows needed for space efficiency)
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (beforeLines[i] === afterLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Walk the LCS table to build diff lines
  const result: DiffLine[] = [];
  let beforeNum = 1;
  let afterNum = 1;
  let i = 0;
  let j = 0;

  while (i < m || j < n) {
    if (i < m && j < n && beforeLines[i] === afterLines[j]) {
      result.push({
        kind: "unchanged",
        lineNum: { before: beforeNum++, after: afterNum++ },
        content: beforeLines[i],
      });
      i++;
      j++;
    } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
      result.push({
        kind: "added",
        lineNum: { before: null, after: afterNum++ },
        content: afterLines[j],
      });
      j++;
    } else {
      result.push({
        kind: "removed",
        lineNum: { before: beforeNum++, after: null },
        content: beforeLines[i],
      });
      i++;
    }
  }

  return result;
}

/** Collapse long runs of unchanged lines into a summary row (context: 3 lines). */
function collapseUnchanged(lines: DiffLine[], context = 3): Array<DiffLine | { kind: "collapse"; count: number; startIdx: number }> {
  const result: Array<DiffLine | { kind: "collapse"; count: number; startIdx: number }> = [];
  let unchangedRun: { start: number; end: number } | null = null;

  const flush = (_endIdx: number) => {
    if (!unchangedRun) return;
    const { start, end } = unchangedRun;
    const len = end - start + 1;

    if (len <= context * 2 + 1) {
      // Too short to collapse
      for (let k = start; k <= end; k++) result.push(lines[k]);
    } else {
      // Keep `context` lines at start
      for (let k = start; k < start + context && k <= end; k++)
        result.push(lines[k]);
      // Collapse middle
      result.push({ kind: "collapse", count: len - context * 2, startIdx: start + context });
      // Keep `context` lines at end
      for (let k = end - context + 1; k <= end; k++) result.push(lines[k]);
    }
    unchangedRun = null;
  };

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].kind === "unchanged") {
      if (!unchangedRun) unchangedRun = { start: i, end: i };
      else unchangedRun.end = i;
    } else {
      flush(i - 1);
      result.push(lines[i]);
    }
  }
  flush(lines.length - 1);

  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const LINE_STYLES: Record<LineKind, { bg: string; text: string; gutter: string; prefix: string }> = {
  added:     { bg: "bg-emerald-50 dark:bg-emerald-950/25",  text: "text-emerald-800 dark:text-emerald-300",  gutter: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-500",   prefix: "+" },
  removed:   { bg: "bg-red-50 dark:bg-red-950/25",          text: "text-red-800 dark:text-red-300",          gutter: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-500",                   prefix: "−" },
  unchanged: { bg: "",                                       text: "text-neutral-700 dark:text-neutral-300",  gutter: "text-neutral-400 dark:text-neutral-600",                                          prefix: " " },
};

interface DiffLineRowProps {
  line: DiffLine;
}

const DiffLineRow: React.FC<DiffLineRowProps> = ({ line }) => {
  const s = LINE_STYLES[line.kind];
  return (
    <div className={`flex font-mono text-xs leading-5 ${s.bg}`}>
      {/* Before line number */}
      <span className={`select-none w-10 shrink-0 text-right pr-2 py-0.5 ${s.gutter} border-r border-neutral-200 dark:border-neutral-700`}>
        {line.lineNum.before ?? ""}
      </span>
      {/* After line number */}
      <span className={`select-none w-10 shrink-0 text-right pr-2 py-0.5 ${s.gutter} border-r border-neutral-200 dark:border-neutral-700`}>
        {line.lineNum.after ?? ""}
      </span>
      {/* Diff gutter symbol */}
      <span className={`select-none w-6 shrink-0 text-center py-0.5 ${s.gutter} ${s.text} border-r border-neutral-200 dark:border-neutral-700`}>
        {s.prefix}
      </span>
      {/* Content */}
      <span className={`flex-1 py-0.5 px-3 whitespace-pre ${s.text} overflow-x-auto`}>
        {line.content}
      </span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface SchemaDiffViewProps {
  beforeSchema: any;
  afterSchema: any;
  onClose: () => void;
}

export const SchemaDiffView: React.FC<SchemaDiffViewProps> = ({
  beforeSchema,
  afterSchema,
  onClose,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const beforeStr = useMemo(
    () => JSON.stringify(beforeSchema, null, 2),
    [beforeSchema],
  );
  const afterStr = useMemo(
    () => JSON.stringify(afterSchema, null, 2),
    [afterSchema],
  );

  const rawDiff = useMemo(() => {
    return computeDiff(beforeStr.split("\n"), afterStr.split("\n"));
  }, [beforeStr, afterStr]);

  const displayLines = useMemo(
    () => (showAll ? rawDiff : collapseUnchanged(rawDiff, 3)),
    [rawDiff, showAll],
  );

  const addedCount = rawDiff.filter((l) => l.kind === "added").length;
  const removedCount = rawDiff.filter((l) => l.kind === "removed").length;
  const hasChanges = addedCount > 0 || removedCount > 0;

  const copyAfter = () => {
    navigator.clipboard.writeText(afterStr).then(() => {
      setCopied(true);
      toast.success("Enhanced schema copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="diff-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <motion.div
          key="diff-panel"
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="pointer-events-auto w-full max-w-5xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "88vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center">
                <GitCompare className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Schema Diff
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  AI-enhanced changes vs original converted schema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges ? (
                <>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-0 gap-1">
                    <Plus className="h-3 w-3" />
                    {addedCount}
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-0 gap-1">
                    <Minus className="h-3 w-3" />
                    {removedCount}
                  </Badge>
                </>
              ) : (
                <Badge className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-0 gap-1">
                  <Equal className="h-3 w-3" />
                  No changes
                </Badge>
              )}

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAfter}
                  className="gap-1.5 h-8 text-xs"
                  title="Copy enhanced schema"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex shrink-0 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
            <div className="flex-1 px-6 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 border-r border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-400" />
              Before (original converted)
            </div>
            <div className="flex-1 px-6 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              After (AI enhanced + applied)
            </div>
          </div>

          {/* Diff body */}
          <div className="flex-1 overflow-y-auto font-mono" style={{ minHeight: 0 }}>
            {!hasChanges ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-400 dark:text-neutral-500 gap-2">
                <Equal className="h-8 w-8" />
                <p className="text-sm font-medium">No changes detected</p>
                <p className="text-xs">
                  The schema was not modified by AI enhancements.
                </p>
              </div>
            ) : (
              <div className="text-xs">
                {displayLines.map((item, idx) => {
                  if ("count" in item) {
                    // Collapsed run
                    return (
                      <div
                        key={`collapse-${idx}`}
                        className="flex items-center gap-2 px-4 py-1 bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 dark:text-neutral-500 text-xs border-y border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700/60 select-none"
                        onClick={() => setShowAll(true)}
                      >
                        <ChevronDown className="h-3 w-3" />
                        <span>
                          {item.count} unchanged line{item.count !== 1 ? "s" : ""} — click to expand
                        </span>
                      </div>
                    );
                  }
                  return <DiffLineRow key={idx} line={item as DiffLine} />;
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-900 border border-emerald-400 dark:border-emerald-700" />
                Added
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-200 dark:bg-red-900 border border-red-400 dark:border-red-700" />
                Removed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600" />
                Unchanged
              </span>
            </div>

            {!showAll && hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="gap-1.5 text-xs h-7"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Show full file
              </Button>
            )}
            {showAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(false)}
                className="gap-1.5 text-xs h-7"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Collapse unchanged
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";

interface PipelineStage {
  name: string;
  status: "pending" | "loading" | "complete" | "error";
}

export interface FlowDiagramProps {
  stages: PipelineStage[];
  /**
   * `card` — padded panel with border (pages, marketing-style).
   * `strip` — dense single-row pipeline for the form builder toolbar (no card chrome).
   */
  variant?: "card" | "strip";
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({
  stages,
  variant = "card",
}) => {
  const completedCount = stages.filter((s) => s.status === "complete").length;
  const strip = variant === "strip";

  const outerClass = strip
    ? "w-full min-w-0 bg-transparent py-0.5"
    : "px-8 py-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm";

  const nodeSize = strip ? "w-7 h-7 border-2" : "w-9 h-9 border-2";
  const iconClass = strip ? "h-3.5 w-3.5" : "h-4 w-4";
  const numClass = strip
    ? "text-[10px] font-semibold"
    : "text-xs font-semibold";
  const labelClass = strip ? "text-[10px]" : "text-[11px]";
  const colGap = strip ? "gap-1.5" : "gap-2.5";
  const connectorMb = strip ? "mb-5" : "mb-7";
  const connectorMx = strip ? "mx-0.5" : "mx-1";

  return (
    <div className={outerClass}>
      <div className="flex min-w-0 items-center">
        {stages.map((stage, index) => {
          const isComplete = stage.status === "complete";
          const isLoading = stage.status === "loading";
          const isError = stage.status === "error";
          const isLast = index === stages.length - 1;
          const connectorFilled = index < completedCount;

          return (
            <React.Fragment key={stage.name}>
              <div
                className={`flex min-w-0 flex-col items-center ${colGap} flex-shrink-0`}
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                  className={`
                    relative ${nodeSize} rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${
                      isComplete
                        ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40"
                        : isLoading
                          ? "bg-blue-500 border-blue-500 shadow-sm shadow-blue-200 dark:shadow-blue-900/40"
                          : isError
                            ? "bg-red-500 border-red-500"
                            : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600"
                    }
                  `}
                >
                  <AnimatePresence mode="wait">
                    {isComplete && (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check
                          className={`${iconClass} text-white`}
                          strokeWidth={2.5}
                        />
                      </motion.div>
                    )}
                    {isLoading && (
                      <motion.div
                        key="spin"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Loader2
                          className={`${iconClass} text-white animate-spin`}
                        />
                      </motion.div>
                    )}
                    {isError && (
                      <motion.div
                        key="err"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <AlertCircle className={`${iconClass} text-white`} />
                      </motion.div>
                    )}
                    {!isComplete && !isLoading && !isError && (
                      <motion.div
                        key="num"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex h-full w-full items-center justify-center"
                      >
                        <span
                          className={`${numClass} leading-none text-neutral-400 dark:text-neutral-500 select-none`}
                        >
                          {index + 1}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <span
                  className={`${labelClass} max-w-[5.5rem] truncate font-medium text-center leading-tight sm:max-w-none sm:whitespace-nowrap transition-colors duration-300 ${
                    isComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isLoading
                        ? "text-blue-600 dark:text-blue-400"
                        : isError
                          ? "text-red-500"
                          : "text-neutral-400 dark:text-neutral-500"
                  }`}
                  title={stage.name}
                >
                  {stage.name}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`relative flex-1 ${connectorMx} ${connectorMb} h-0.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700`}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: "0%" }}
                    animate={{ width: connectorFilled ? "100%" : "0%" }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      delay: index * 0.05,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

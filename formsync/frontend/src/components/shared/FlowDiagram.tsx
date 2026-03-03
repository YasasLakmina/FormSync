import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface PipelineStage {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface FlowDiagramProps {
  stages: PipelineStage[];
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ stages }) => {
  const completedCount = stages.filter((s) => s.status === 'complete').length;

  return (
    <div className="px-8 py-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center">
        {stages.map((stage, index) => {
          const isComplete = stage.status === 'complete';
          const isLoading = stage.status === 'loading';
          const isError = stage.status === 'error';
          const isLast = index === stages.length - 1;
          const connectorFilled = index < completedCount;

          return (
            <React.Fragment key={stage.name}>
              {/* Node + Label */}
              <div className="flex flex-col items-center gap-2.5 flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.2, ease: 'easeOut' }}
                  className={`
                    relative w-9 h-9 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isComplete
                      ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40'
                      : isLoading
                      ? 'bg-blue-500 border-blue-500 shadow-sm shadow-blue-200 dark:shadow-blue-900/40'
                      : isError
                      ? 'bg-red-500 border-red-500'
                      : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600'
                    }
                  `}
                >
                  <AnimatePresence mode="wait">
                    {isComplete && (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                        <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                      </motion.div>
                    )}
                    {isLoading && (
                      <motion.div key="spin" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      </motion.div>
                    )}
                    {isError && (
                      <motion.div key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                        <AlertCircle className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                    {!isComplete && !isLoading && !isError && (
                      <motion.div key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <span className="text-xs font-semibold leading-none text-neutral-400 dark:text-neutral-500 select-none">
                          {index + 1}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Label */}
                <span
                  className={`text-[11px] font-medium text-center leading-tight whitespace-nowrap transition-colors duration-300 ${
                    isComplete
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isLoading
                      ? 'text-blue-600 dark:text-blue-400'
                      : isError
                      ? 'text-red-500'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {stage.name}
                </span>
              </div>

              {/* Connector line between nodes */}
              {!isLast && (
                <div className="flex-1 mx-1 mb-7 relative h-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: connectorFilled ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.05 }}
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

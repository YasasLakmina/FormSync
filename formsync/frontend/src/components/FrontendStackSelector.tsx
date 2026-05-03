/**
 * Frontend stack for fullstack ZIP — mirrors BackendLanguageSelector layout.
 */

import React from "react";
import { Code2, LayoutTemplate } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FrontendStack } from "@/services/generationService";

interface FrontendStackSelectorProps {
  selected: FrontendStack;
  onChange: (stack: FrontendStack) => void;
  className?: string;
}

const options: {
  id: FrontendStack;
  label: string;
  description: string;
  icon: typeof Code2 | typeof LayoutTemplate;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorderColor: string;
  textColor: string;
}[] = [
  {
    id: "react",
    label: "React (Vite)",
    description: "SPA · TypeScript · exports all builder field types (files as Base64-in-JSON)",
    icon: Code2,
    color: "from-purple-500 to-blue-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-500",
    hoverBorderColor: "hover:border-purple-300 dark:hover:border-purple-600",
    textColor: "text-purple-800 dark:text-purple-300",
  },
  {
    id: "htmlBootstrap",
    label: "HTML + Bootstrap",
    description: "Static files · no build · same palette (repeaters, files, calculated, etc.)",
    icon: LayoutTemplate,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-500",
    hoverBorderColor: "hover:border-amber-300 dark:hover:border-amber-600",
    textColor: "text-amber-800 dark:text-amber-300",
  },
];

export const FrontendStackSelector: React.FC<FrontendStackSelectorProps> = ({
  selected,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-3 gap-2 sm:gap-3",
        className,
      )}
      role="radiogroup"
      aria-label="Frontend generation stack"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.id;

        return (
          <motion.button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative flex min-w-0 w-full items-center gap-2 sm:gap-3 px-2 py-3 sm:px-4 rounded-xl transition-all duration-200",
              "border-2 cursor-pointer group",
              isSelected
                ? `${opt.borderColor} shadow-lg scale-[1.02]`
                : `border-neutral-200 dark:border-neutral-700 ${opt.hoverBorderColor}`,
              opt.bgColor,
            )}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                isSelected &&
                  `bg-gradient-to-br ${opt.color} text-white shadow-md`,
                !isSelected &&
                  "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
              )}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="text-left min-w-0">
              <div
                className={cn(
                  "font-semibold text-sm",
                  isSelected
                    ? opt.textColor
                    : "text-neutral-700 dark:text-neutral-300",
                )}
              >
                {opt.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-2">
                {opt.description}
              </div>
            </div>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br ${opt.color} rounded-full flex items-center justify-center shadow-lg`}
              >
                <span className="text-white text-xs font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

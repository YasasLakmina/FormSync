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
      className={cn("grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3", className)}
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
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
              opt.bgColor,
              isSelected ? opt.borderColor : "border-transparent",
              opt.hoverBorderColor,
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                opt.color,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className={cn("font-semibold", opt.textColor)}>{opt.label}</div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {opt.description}
              </p>
            </div>
            {isSelected && (
              <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-current opacity-80" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

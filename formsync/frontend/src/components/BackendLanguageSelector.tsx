/**
 * Backend language cards — matches FormatSelector visual language (Schema Editor).
 */

import React from "react";
import { Coffee, Brackets } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BackendLanguage } from "@/services/generationService";

interface BackendLanguageSelectorProps {
  selected: BackendLanguage;
  onChange: (lang: BackendLanguage) => void;
  className?: string;
}

const options: {
  id: BackendLanguage;
  label: string;
  description: string;
  icon: typeof Coffee;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorderColor: string;
  textColor: string;
}[] = [
  {
    id: "springBoot",
    label: "Spring Boot",
    description: "Java · REST APIs · production-ready server",
    icon: Coffee,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-500",
    hoverBorderColor:
      "hover:border-emerald-300 dark:hover:border-emerald-600",
    textColor: "text-emerald-800 dark:text-emerald-300",
  },
  {
    id: "nodeExpress",
    label: "Node.js",
    description: "Express · JavaScript backend",
    icon: Brackets,
    color: "from-violet-500 to-indigo-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-500",
    hoverBorderColor: "hover:border-violet-300 dark:hover:border-violet-600",
    textColor: "text-violet-800 dark:text-violet-300",
  },
];

export const BackendLanguageSelector: React.FC<
  BackendLanguageSelectorProps
> = ({ selected, onChange, className }) => {
  return (
    <div
      className={cn("flex gap-3 flex-wrap", className)}
      role="radiogroup"
      aria-label="Backend generation language"
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
              "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              "border-2 cursor-pointer group min-w-[min(100%,220px)] flex-1 sm:flex-none sm:min-w-[240px]",
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

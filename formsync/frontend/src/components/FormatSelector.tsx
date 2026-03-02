/**
 * Format Selector Component
 * 
 * Visual cards for selecting input format (JSON, YAML, XML)
 */

import React from 'react';
import { FileJson, FileCode, FileType } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FormatType = 'json' | 'yaml' | 'xml';

interface FormatSelectorProps {
  selected: FormatType;
  onChange: (format: FormatType) => void;
}

const formats = [
  {
    type: 'json' as FormatType,
    label: 'JSON',
    description: 'JavaScript Object Notation',
    icon: FileJson,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-500',
    hoverBorderColor: 'hover:border-blue-300 dark:hover:border-blue-600',
    ringColor: 'ring-blue-400/50',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  {
    type: 'yaml' as FormatType,
    label: 'YAML',
    description: 'YAML Ain\'t Markup Language',
    icon: FileCode,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-500',
    hoverBorderColor: 'hover:border-purple-300 dark:hover:border-purple-600',
    ringColor: 'ring-purple-400/50',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    type: 'xml' as FormatType,
    label: 'XML',
    description: 'Extensible Markup Language',
    icon: FileType,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-500',
    hoverBorderColor: 'hover:border-orange-300 dark:hover:border-orange-600',
    ringColor: 'ring-orange-400/50',
    textColor: 'text-orange-700 dark:text-orange-300',
  },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {formats.map((format) => {
        const Icon = format.icon;
        const isSelected = selected === format.type;

        return (
          <motion.button
            key={format.type}
            onClick={() => onChange(format.type)}
            className={cn(
              'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
              'border-2 cursor-pointer group',
              isSelected
                ? `${format.borderColor} shadow-lg scale-105`
                : `border-neutral-200 dark:border-neutral-700 ${format.hoverBorderColor}`,
              format.bgColor
            )}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isSelected && `bg-gradient-to-br ${format.color} text-white`,
                !isSelected && 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <div className="text-left">
              <div className={cn(
                'font-semibold text-sm',
                isSelected ? format.textColor : 'text-neutral-700 dark:text-neutral-300'
              )}>
                {format.label}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-500">
                {format.description}
              </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br ${format.color} rounded-full flex items-center justify-center shadow-lg`}
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

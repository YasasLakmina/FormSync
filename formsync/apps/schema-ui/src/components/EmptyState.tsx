/**
 * Empty State Component
 * 
 * Beautiful empty state with suggested actions
 */

import React from 'react';
import { Upload, FileJson, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onUploadClick?: () => void;
  onTemplateClick?: () => void;
  onPasteClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onUploadClick,
  onTemplateClick,
  onPasteClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center h-full min-h-[400px]"
    >
      <div className="text-center max-w-md">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-primary mb-6"
        >
          <FileJson className="w-12 h-12 text-white float" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-neutral-800 dark:text-neutral-100">
          No Schema Loaded
        </h3>

        {/* Description */}
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Get started by uploading a file, selecting a template, or pasting your schema code
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="gradient"
            size="lg"
            onClick={onUploadClick}
            className="gap-2"
          >
            <Upload className="h-5 w-5" />
            Upload File
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onTemplateClick}
            className="gap-2"
          >
            <Sparkles className="h-5 w-5" />
            Browse Templates
          </Button>
        </div>

        {/* Keyboard Hint */}
        <div className="mt-8 text-sm text-neutral-500 dark:text-neutral-500">
          Or paste your code directly into the editor
        </div>
      </div>
    </motion.div>
  );
};

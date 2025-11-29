/**
 * Action Toolbar Component
 * 
 * Floating toolbar with primary actions (Convert, Validate, AI Enhance)
 */

import React from 'react';
import { Zap, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ActionToolbarProps {
  onConvert: () => void;
  onValidate: () => void;
  onEnhance: () => void;
  isConverting?: boolean;
  isValidating?: boolean;
  isEnhancing?: boolean;
  disabled?: boolean;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onConvert,
  onValidate,
  onEnhance,
  isConverting,
  isValidating,
  isEnhancing,
  disabled,
}) => {
  return (
    <div className="glass rounded-2xl p-2 flex items-center gap-2 shadow-xl border border-white/20 dark:border-white/10">
      {/* Convert Button - Primary Action */}
      <Button
        onClick={onConvert}
        disabled={disabled || isConverting}
        variant="gradient"
        size="lg"
        className="gap-2 px-6"
      >
        {isConverting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Convert
          </>
        )}
      </Button>

      {/* Validate Button */}
      <Button
        onClick={onValidate}
        disabled={disabled || isValidating}
        variant="outline"
        size="lg"
        className="gap-2 px-6 hover:bg-success-50 dark:hover:bg-success-950/20 hover:border-success-500"
      >
        {isValidating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Validating...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            Validate
          </>
        )}
      </Button>

      {/* AI Enhance Button */}
      <Button
        onClick={onEnhance}
        disabled={disabled || isEnhancing}
        variant="outline"
        size="lg"
        className="gap-2 px-6 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:border-purple-500"
      >
        {isEnhancing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            AI Enhance
          </>
        )}
      </Button>

      {/* Keyboard Shortcut Hints */}
      <div className="hidden lg:flex items-center gap-4 ml-4 pl-4 border-l border-white/20 dark:border-white/10">
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">Ctrl+Enter</kbd>
          <span className="ml-1">Convert</span>
        </div>
      </div>
    </div>
  );
};

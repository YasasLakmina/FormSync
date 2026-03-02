import React from 'react';
import { Button } from '../ui/button';
import { Sparkles, Zap } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  disabled,
  isGenerating,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isGenerating}
      size="lg"
      className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-xl text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isGenerating ? (
        <>
          <Zap className="h-5 w-5 animate-pulse" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5" />
          Generate Code
        </>
      )}
    </Button>
  );
};

/**
 * Comprehensive Schema Quality Report Component
 *
 * Displays detailed quality evaluation including:
 * - Overall quality score with status badge
 * - 5-dimensional breakdown
 * - Detected issues and warnings
 * - AI enhancement summary
 * - Improvement tips
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Target,
  Shield,
  Accessibility,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface QualityMetrics {
  qualityScore: number;
  qualityBreakdown: {
    structure: number;
    validation: number;
    accessibility: number;
    consistency: number;
    improvement: number;
  };
  issues: string[];
  explanations: Array<{
    path: string;
    action: string;
    reason: string;
  }>;
  metrics: {
    totalChanges: number;
    accessibilityCoverage: number;
  };
  appliedSuggestionsCount?: number;
  totalSuggestionsCount?: number;
}

interface QualityMetricsPanelProps {
  metrics: QualityMetrics;
  onClose: () => void;
}

export const QualityMetricsPanel: React.FC<QualityMetricsPanelProps> = ({ metrics, onClose }) => {
  // Quality level determination
  const getQualityLevel = (score: number) => {
    if (score >= 90)
      return {
        label: 'Excellent',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        textColor: 'text-green-600 dark:text-green-400',
      };
    if (score >= 75)
      return {
        label: 'Good',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        textColor: 'text-blue-600 dark:text-blue-400',
      };
    if (score >= 60)
      return {
        label: 'Fair',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        textColor: 'text-yellow-600 dark:text-yellow-400',
      };
    return {
      label: 'Needs Improvement',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      textColor: 'text-red-600 dark:text-red-400',
    };
  };

  const qualityLevel = getQualityLevel(metrics.qualityScore);
  const accessibilityPercent = Math.round(metrics.metrics.accessibilityCoverage * 100);

  // Dimension details
  const dimensions = [
    {
      name: 'Structural Completeness',
      score: metrics.qualityBreakdown.structure,
      max: 25,
      description: 'Schema structure and nesting',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      name: 'Validation Strength',
      score: metrics.qualityBreakdown.validation,
      max: 25,
      description: 'Field validation coverage',
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      name: 'Accessibility & Metadata',
      score: metrics.qualityBreakdown.accessibility,
      max: 20,
      description: 'Descriptions and a11y labels',
      icon: Accessibility,
      color: 'text-green-600',
    },
    {
      name: 'Consistency & Safety',
      score: metrics.qualityBreakdown.consistency,
      max: 20,
      description: 'Logical consistency checks',
      icon: CheckCircle,
      color: 'text-indigo-600',
    },
    {
      name: 'AI Improvement Depth',
      score: metrics.qualityBreakdown.improvement,
      max: 10,
      description: 'Meaningful AI enhancements',
      icon: Sparkles,
      color: 'text-amber-600',
    },
  ];

  // Generate improvement tips from issues
  const generateTips = () => {
    const tips: string[] = [];

    if (metrics.qualityBreakdown.validation < 20) {
      tips.push('Add validation rules (patterns, min/max length) to improve data quality');
    }
    if (metrics.qualityBreakdown.accessibility < 15) {
      tips.push('Add descriptions and accessibility labels for better usability');
    }
    if (metrics.qualityBreakdown.structure < 20) {
      tips.push('Ensure all nested objects define properties and arrays define items');
    }

    // Add specific tips from issues
    metrics.issues.slice(0, 3).forEach((issue) => {
      const cleanIssue = issue.replace(/^\d+\s+field\(s\)\s+/, '');
      if (!tips.some((t) => t.includes(cleanIssue.substring(0, 20)))) {
        tips.push(cleanIssue.charAt(0).toUpperCase() + cleanIssue.slice(1));
      }
    });

    return tips.slice(0, 4); // Max 4 tips
  };

  const improvementTips = generateTips();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-white dark:bg-neutral-900 shadow-2xl">
          {/* Header Section */}
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <span>Schema Quality Report</span>
                  <Badge className={qualityLevel.color}>{qualityLevel.label}</Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  Comprehensive evaluation across 5 quality dimensions
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Overall Score */}
            <div className="mt-4 text-center py-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Overall Quality Score
              </div>
              <div className={`text-5xl font-bold ${qualityLevel.textColor}`}>
                {metrics.qualityScore}
                <span className="text-2xl text-neutral-500 ml-1">/100</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Quality Breakdown Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Quality Breakdown
              </h3>
              <div className="space-y-3">
                {dimensions.map((dim, idx) => {
                  const percentage = (dim.score / dim.max) * 100;
                  const Icon = dim.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${dim.color}`} />
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {dim.name}
                          </span>
                        </div>
                        <span
                          className={`font-bold ${dim.score === dim.max ? 'text-green-600' : 'text-neutral-700 dark:text-neutral-300'}`}
                        >
                          {Math.round(dim.score)} / {dim.max}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {dim.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Issues & Warnings Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Issues & Warnings
              </h3>
              {metrics.issues.length > 0 ? (
                <div className="space-y-2">
                  {metrics.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800 flex items-start gap-2"
                    >
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-900 dark:text-amber-100">{issue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    No critical issues detected
                  </span>
                </div>
              )}
            </div>

            {/* AI Enhancement Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Enhancement Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="text-2xl font-bold text-indigo-600">{accessibilityPercent}%</div>
                  <div className="text-sm text-indigo-900 dark:text-indigo-100">
                    Accessibility Coverage
                  </div>
                </div>
                {metrics.appliedSuggestionsCount !== undefined &&
                  metrics.totalSuggestionsCount !== undefined && (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.appliedSuggestionsCount}/{metrics.totalSuggestionsCount}
                        </div>
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                          Suggestions Applied
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.totalSuggestionsCount > 0
                            ? Math.round(
                                (metrics.appliedSuggestionsCount / metrics.totalSuggestionsCount) *
                                  100
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-green-900 dark:text-green-100">
                          Engagement Rate
                        </div>
                      </div>
                    </>
                  )}
              </div>

              {metrics.explanations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Example Enhancements:
                  </div>
                  {metrics.explanations.slice(0, 3).map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs mt-0.5 flex-shrink-0">
                          {exp.action}
                        </Badge>
                        <div className="flex-1 text-sm">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                            {exp.path}
                          </div>
                          <div className="text-neutral-600 dark:text-neutral-400">{exp.reason}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Improvement Tips Section */}
            {improvementTips.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Improvement Tips
                </h3>
                <div className="space-y-2">
                  {improvementTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800 flex items-start gap-2"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-sm text-blue-900 dark:text-blue-100">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                💡 This report is generated using deterministic, rule-based quality evaluation
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

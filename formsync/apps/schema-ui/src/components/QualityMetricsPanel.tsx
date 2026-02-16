/**
 * Professional Schema Quality Report Component
 *
 * Enterprise-grade quality evaluation display with:
 * - Overall quality score with visual status indicator
 * - Critical metrics dashboard (Score, Critical Issues, Accessibility)
 * - Priority-based action recommendations
 * - Dimensional breakdown with pass/fail criteria
 * - Severity-categorized issues (Critical, Warning)
 * - AI enhancement summary with applied improvements
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
  AlertCircle,
  XCircle,
  ArrowRight,
  CheckCircle2,
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
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
        textColor: 'text-emerald-600 dark:text-emerald-400',
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
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        textColor: 'text-amber-600 dark:text-amber-400',
      };
    return {
      label: 'Needs Improvement',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      textColor: 'text-red-600 dark:text-red-400',
    };
  };

  const qualityLevel = getQualityLevel(metrics.qualityScore);
  const accessibilityPercent = Math.round(metrics.metrics.accessibilityCoverage * 100);

  // Categorize issues by severity
  const categorizeIssues = () => {
    const critical: string[] = [];
    const warnings: string[] = [];

    metrics.issues.forEach((issue) => {
      const lower = issue.toLowerCase();
      if (
        lower.includes('missing required') ||
        lower.includes('accessibility') ||
        lower.includes('critical')
      ) {
        critical.push(issue);
      } else {
        warnings.push(issue);
      }
    });

    // Add accessibility as critical if below 30%
    if (accessibilityPercent < 30 && !critical.some(i => i.toLowerCase().includes('accessibility'))) {
      critical.unshift(`Low accessibility coverage (${accessibilityPercent}%): Add descriptions to improve usability and compliance`);
    }

    return { critical, warnings };
  };

  const { critical, warnings } = categorizeIssues();
  const criticalCount = critical.length;

  // Dimension details with pass/fail thresholds
  const dimensions = [
    {
      name: 'Structural Completeness',
      score: metrics.qualityBreakdown.structure,
      max: 25,
      threshold: 20, // 80% to pass
      description: 'JSON Schema Draft-07 compliance',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      name: 'Validation Coverage',
      score: metrics.qualityBreakdown.validation,
      max: 25,
      threshold: 20,
      description: 'Field constraints',
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      name: 'Accessibility Compliance',
      score: metrics.qualityBreakdown.accessibility,
      max: 20,
      threshold: 15, // 75% to pass
      description: 'WCAG & documentation',
      icon: Accessibility,
      color: 'text-emerald-600',
    },
    {
      name: 'Consistency & Safety',
      score: metrics.qualityBreakdown.consistency,
      max: 20,
      threshold: 15,
      description: 'Type safety & boundaries',
      icon: CheckCircle,
      color: 'text-indigo-600',
    },
    {
      name: 'Enhancement Impact',
      score: metrics.qualityBreakdown.improvement,
      max: 10,
      threshold: 7, // 70% to pass
      description: 'Human-validated improvements',
      icon: Sparkles,
      color: 'text-amber-600',
    },
  ];

  // Generate priority actions
  const generatePriorityActions = () => {
    const actions: Array<{ priority: 'high' | 'medium' | 'low'; text: string }> = [];

    // Critical: Accessibility
    if (accessibilityPercent < 30) {
      actions.push({
        priority: 'high',
        text: `Add descriptions to fields (${100 - accessibilityPercent}% missing accessibility metadata)`,
      });
    }

    // High: Low validation
    if (metrics.qualityBreakdown.validation < 15) {
      actions.push({
        priority: 'high',
        text: 'Add validation rules (patterns, min/max, formats) to critical fields',
      });
    }

    // Medium: Partial accessibility
    if (accessibilityPercent >= 30 && accessibilityPercent < 70) {
      actions.push({
        priority: 'medium',
        text: `Improve accessibility coverage from ${accessibilityPercent}% to 70%+`,
      });
    }

    // Medium: Structure issues
    if (metrics.qualityBreakdown.structure < 20) {
      actions.push({
        priority: 'medium',
        text: 'Define properties for all objects and items for all arrays',
      });
    }

    // Low: Apply AI suggestions
    if (
      metrics.appliedSuggestionsCount !== undefined &&
      metrics.totalSuggestionsCount !== undefined &&
      metrics.appliedSuggestionsCount < metrics.totalSuggestionsCount
    ) {
      const remaining = metrics.totalSuggestionsCount - metrics.appliedSuggestionsCount;
      actions.push({
        priority: 'low',
        text: `Review and apply ${remaining} remaining AI suggestion${remaining > 1 ? 's' : ''}`,
      });
    }

    return actions.slice(0, 4); // Max 4 actions
  };

  const priorityActions = generatePriorityActions();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-white dark:bg-neutral-900 shadow-2xl">
          {/* Header Section */}
          <CardHeader className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl font-bold">Schema Quality Report</CardTitle>
                  <Badge className={qualityLevel.color}>{qualityLevel.label}</Badge>
                </div>
                <CardDescription>
                  Comprehensive evaluation across 5 quality dimensions
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {/* Overall Score */}
              <div className="col-span-1 p-6 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 text-center">
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wide">
                  Overall Score
                </div>
                <div className={`text-5xl font-bold ${qualityLevel.textColor}`}>
                  {metrics.qualityScore}
                </div>
                <div className="text-sm text-neutral-500 mt-1">out of 100</div>
              </div>

              {/* Critical Issues */}
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-1">
                  {criticalCount === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                    Critical Issues
                  </div>
                </div>
                <div
                  className={`text-3xl font-bold ${criticalCount === 0 ? 'text-emerald-600' : 'text-red-600'}`}
                >
                  {criticalCount}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {criticalCount === 0 ? 'All checks passed' : 'Requires attention'}
                </div>
              </div>

              {/* Accessibility Coverage */}
              <div
                className={`p-4 rounded-xl border ${
                  accessibilityPercent >= 70
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : accessibilityPercent >= 30
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Accessibility
                    className={`h-5 w-5 ${
                      accessibilityPercent >= 70
                        ? 'text-emerald-600'
                        : accessibilityPercent >= 30
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  />
                  <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                    Accessibility
                  </div>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    accessibilityPercent >= 70
                      ? 'text-emerald-600'
                      : accessibilityPercent >= 30
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {accessibilityPercent}%
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {accessibilityPercent >= 70
                    ? 'Good coverage'
                    : accessibilityPercent >= 30
                      ? 'Needs improvement'
                      : 'Critical gap'}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Priority Actions Section */}
            {priorityActions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                  Recommended Actions
                </h3>
                <div className="space-y-3">
                  {priorityActions.map((action, idx) => {
                    const priorityConfig = {
                      high: {
                        icon: AlertCircle,
                        color: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
                        iconColor: 'text-red-600',
                        badge: 'bg-red-600 text-white',
                        label: 'HIGH',
                      },
                      medium: {
                        icon: AlertTriangle,
                        color:
                          'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
                        iconColor: 'text-amber-600',
                        badge: 'bg-amber-600 text-white',
                        label: 'MEDIUM',
                      },
                      low: {
                        icon: Info,
                        color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                        iconColor: 'text-blue-600',
                        badge: 'bg-blue-600 text-white',
                        label: 'LOW',
                      },
                    };

                    const config = priorityConfig[action.priority];
                    const Icon = config.icon;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${config.color} flex items-start gap-3`}
                      >
                        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${config.badge} text-xs px-2 py-0.5`}>
                              {config.label} PRIORITY
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {action.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quality Dimension Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Quality Dimension Breakdown
              </h3>
              <div className="space-y-3">
                {dimensions.map((dim, idx) => {
                  const percentage = (dim.score / dim.max) * 100;
                  const passed = dim.score >= dim.threshold;
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
                          {passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}
                          >
                            {Math.round(dim.score)}
                          </span>
                          <span className="text-neutral-500">/ {dim.max}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passed ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {dim.description}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {passed ? 'Passed' : `${Math.round((dim.threshold / dim.max) * 100)}% required`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Issues Section */}
            {(critical.length > 0 || warnings.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Detected Issues
                </h3>
                <div className="space-y-3">
                  {/* Critical Issues */}
                  {critical.map((issue, idx) => (
                    <div
                      key={`critical-${idx}`}
                      className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800 flex items-start gap-2"
                    >
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <Badge className="bg-red-600 text-white text-xs mb-1">CRITICAL</Badge>
                        <p className="text-sm text-red-900 dark:text-red-100">{issue}</p>
                      </div>
                    </div>
                  ))}

                  {/* Warnings */}
                  {warnings.map((issue, idx) => (
                    <div
                      key={`warning-${idx}`}
                      className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800 flex items-start gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <Badge className="bg-amber-600 text-white text-xs mb-1">WARNING</Badge>
                        <p className="text-sm text-amber-900 dark:text-amber-100">{issue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Issues State */}
            {critical.length === 0 && warnings.length === 0 && (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                <p className="font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                  No critical issues detected
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Your schema meets all quality standards
                </p>
              </div>
            )}

            {/* AI Enhancement Summary */}
            {metrics.explanations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Improvements Applied
                </h3>
                <div className="grid gap-3">
                  {metrics.explanations.slice(0, 3).map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {exp.action}
                            </Badge>
                            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                              {exp.path}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            {exp.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Applied Suggestions Counter */}
                  {metrics.appliedSuggestionsCount !== undefined &&
                    metrics.totalSuggestionsCount !== undefined && (
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-center">
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                            {metrics.appliedSuggestionsCount}
                          </span>{' '}
                          of{' '}
                          <span className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                            {metrics.totalSuggestionsCount}
                          </span>{' '}
                          AI suggestions applied
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Report generated using deterministic quality evaluation • Scores update in real-time
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

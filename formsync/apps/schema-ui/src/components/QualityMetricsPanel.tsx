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
  const getQualityLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', scoreColor: 'text-emerald-600', badgeBg: 'bg-emerald-100 text-emerald-800', ring: 'stroke-emerald-500' };
    if (score >= 75) return { label: 'Good',      scoreColor: 'text-blue-600',    badgeBg: 'bg-blue-100 text-blue-800',    ring: 'stroke-blue-500' };
    if (score >= 60) return { label: 'Fair',      scoreColor: 'text-amber-600',   badgeBg: 'bg-amber-100 text-amber-800',  ring: 'stroke-amber-500' };
    return                  { label: 'Needs Work', scoreColor: 'text-red-600',     badgeBg: 'bg-red-100 text-red-800',      ring: 'stroke-red-500' };
  };

  const qualityLevel = getQualityLevel(metrics.qualityScore);
  const accessibilityPercent = Math.round(metrics.metrics.accessibilityCoverage * 100);

  const categorizeIssues = () => {
    const critical: string[] = [];
    const warnings: string[] = [];
    metrics.issues.forEach((issue) => {
      const lower = issue.toLowerCase();
      if (lower.includes('missing required') || lower.includes('accessibility') || lower.includes('critical')) {
        critical.push(issue);
      } else {
        warnings.push(issue);
      }
    });
    if (accessibilityPercent < 30 && !critical.some((i) => i.toLowerCase().includes('accessibility'))) {
      critical.unshift(`Low accessibility coverage (${accessibilityPercent}%): Add descriptions to improve usability and compliance`);
    }
    return { critical, warnings };
  };

  const { critical, warnings } = categorizeIssues();
  const criticalCount = critical.length;

  const dimensions = [
    { name: 'Structural Completeness',  score: metrics.qualityBreakdown.structure,    max: 25, threshold: 20, description: 'JSON Schema Draft-07 compliance', icon: Target,        color: 'text-blue-600',    bar: 'bg-blue-500' },
    { name: 'Validation Coverage',      score: metrics.qualityBreakdown.validation,   max: 25, threshold: 20, description: 'Field constraints & patterns',    icon: Shield,        color: 'text-purple-600',  bar: 'bg-purple-500' },
    { name: 'Accessibility Compliance', score: metrics.qualityBreakdown.accessibility, max: 20, threshold: 15, description: 'WCAG & documentation',            icon: Accessibility, color: 'text-emerald-600', bar: 'bg-emerald-500' },
    { name: 'Consistency & Safety',     score: metrics.qualityBreakdown.consistency,  max: 20, threshold: 15, description: 'Type safety & boundaries',        icon: CheckCircle,   color: 'text-indigo-600',  bar: 'bg-indigo-500' },
    { name: 'Enhancement Impact',       score: metrics.qualityBreakdown.improvement,  max: 10, threshold: 7,  description: 'Human-validated improvements',    icon: Sparkles,      color: 'text-amber-600',   bar: 'bg-amber-500' },
  ];

  const priorityActions = (() => {
    const actions: Array<{ priority: 'high' | 'medium' | 'low'; text: string }> = [];
    if (accessibilityPercent < 30)
      actions.push({ priority: 'high', text: `Add descriptions to fields (${100 - accessibilityPercent}% missing accessibility metadata)` });
    if (metrics.qualityBreakdown.validation < 15)
      actions.push({ priority: 'high', text: 'Add validation rules (patterns, min/max, formats) to critical fields' });
    if (accessibilityPercent >= 30 && accessibilityPercent < 70)
      actions.push({ priority: 'medium', text: `Improve accessibility coverage from ${accessibilityPercent}% to 70%+` });
    if (metrics.qualityBreakdown.structure < 20)
      actions.push({ priority: 'medium', text: 'Define properties for all objects and items for all arrays' });
    if (metrics.appliedSuggestionsCount !== undefined && metrics.totalSuggestionsCount !== undefined && metrics.appliedSuggestionsCount < metrics.totalSuggestionsCount) {
      const remaining = metrics.totalSuggestionsCount - metrics.appliedSuggestionsCount;
      actions.push({ priority: 'low', text: `Review and apply ${remaining} remaining AI suggestion${remaining > 1 ? 's' : ''}` });
    }
    return actions.slice(0, 4);
  })();

  const PRIORITY_CONFIG = {
    high:   { leftBar: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-950/20',    icon: AlertCircle,    iconColor: 'text-red-500',    label: 'HIGH',   labelColor: 'bg-red-500 text-white' },
    medium: { leftBar: 'bg-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/20', icon: AlertTriangle,  iconColor: 'text-amber-500',  label: 'MEDIUM', labelColor: 'bg-amber-500 text-white' },
    low:    { leftBar: 'bg-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/20',   icon: Info,           iconColor: 'text-blue-500',   label: 'LOW',    labelColor: 'bg-blue-500 text-white' },
  };

  // SVG circle progress for score
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const scorePct = metrics.qualityScore / 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-3xl"
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

          {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Schema Quality Report</h2>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${qualityLevel.badgeBg}`}>{qualityLevel.label}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Comprehensive evaluation across 5 quality dimensions</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* â”€â”€ Score Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 grid grid-cols-3 gap-4 flex-shrink-0">
            {/* Score ring */}
            <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Overall Score</p>
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r={radius} strokeWidth="7" className="stroke-neutral-200 dark:stroke-neutral-700" fill="none" />
                  <motion.circle
                    cx="44" cy="44" r={radius} strokeWidth="7"
                    className={qualityLevel.ring}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - scorePct) }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold leading-none ${qualityLevel.scoreColor}`}>{metrics.qualityScore}</span>
                  <span className="text-[10px] text-neutral-400">/ 100</span>
                </div>
              </div>
            </div>

            {/* Critical issues */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              criticalCount === 0
                ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/50'
                : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800/50'
            }`}>
              <div className="flex items-center gap-1.5">
                {criticalCount === 0
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  : <XCircle className="h-4 w-4 text-red-600" />}
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Critical Issues</p>
              </div>
              <div className={`text-4xl font-bold mt-1 ${criticalCount === 0 ? 'text-emerald-600' : 'text-red-600'}`}>{criticalCount}</div>
              <p className="text-xs text-neutral-500 mt-1">{criticalCount === 0 ? 'All checks passed' : 'Requires attention'}</p>
            </div>

            {/* Accessibility */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              accessibilityPercent >= 70
                ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/50'
                : accessibilityPercent >= 30
                  ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/50'
                  : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800/50'
            }`}>
              <div className="flex items-center gap-1.5">
                <Accessibility className={`h-4 w-4 ${
                  accessibilityPercent >= 70 ? 'text-emerald-600' : accessibilityPercent >= 30 ? 'text-amber-600' : 'text-red-600'
                }`} />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Accessibility</p>
              </div>
              <div className={`text-4xl font-bold mt-1 ${
                accessibilityPercent >= 70 ? 'text-emerald-600' : accessibilityPercent >= 30 ? 'text-amber-600' : 'text-red-600'
              }`}>{accessibilityPercent}%</div>
              <p className="text-xs text-neutral-500 mt-1">
                {accessibilityPercent >= 70 ? 'Good coverage' : accessibilityPercent >= 30 ? 'Needs improvement' : 'Critical gap'}
              </p>
            </div>
          </div>

          {/* â”€â”€ Scrollable Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="overflow-y-auto flex-1 p-6 space-y-7">

            {/* Priority Actions */}
            {priorityActions.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Recommended Actions
                </h3>
                <div className="space-y-2">
                  {priorityActions.map((action, idx) => {
                    const cfg = PRIORITY_CONFIG[action.priority];
                    const Icon = cfg.icon;
                    return (
                      <div key={idx} className="flex overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                        <div className={`w-1.5 flex-shrink-0 ${cfg.leftBar}`} />
                        <div className={`flex-1 flex items-center gap-3 px-4 py-3 ${cfg.bg}`}>
                          <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.iconColor}`} />
                          <div className="flex-1">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 ${cfg.labelColor}`}>{cfg.label} PRIORITY</span>
                            <span className="text-sm text-neutral-800 dark:text-neutral-200">{action.text}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quality Dimension Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-500" />
                Quality Dimension Breakdown
              </h3>
              <div className="space-y-2.5">
                {dimensions.map((dim, idx) => {
                  const pct = (dim.score / dim.max) * 100;
                  const passed = dim.score >= dim.threshold;
                  const Icon = dim.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${dim.color}`} />
                          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{dim.name}</span>
                          {passed
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            : <XCircle className="h-3.5 w-3.5 text-amber-500" />}
                        </div>
                        <div className="text-right">
                          <span className={`text-base font-bold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>{Math.round(dim.score)}</span>
                          <span className="text-xs text-neutral-400"> / {dim.max}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${passed ? dim.bar : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.07 }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-neutral-500">{dim.description}</span>
                        <span className={`text-xs font-semibold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {passed ? 'Passed' : `Need ${Math.round((dim.threshold / dim.max) * 100)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detected Issues */}
            {(critical.length > 0 || warnings.length > 0) && (
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Detected Issues
                </h3>
                <div className="space-y-2">
                  {critical.map((issue, idx) => (
                    <div key={`c-${idx}`} className="flex overflow-hidden rounded-xl border border-red-200 dark:border-red-800/50">
                      <div className="w-1.5 flex-shrink-0 bg-red-500" />
                      <div className="flex-1 flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/10">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white mr-2">CRITICAL</span>
                          <span className="text-sm text-red-900 dark:text-red-100">{issue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {warnings.map((issue, idx) => (
                    <div key={`w-${idx}`} className="flex overflow-hidden rounded-xl border border-amber-200 dark:border-amber-800/50">
                      <div className="w-1.5 flex-shrink-0 bg-amber-500" />
                      <div className="flex-1 flex items-start gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-950/10">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white mr-2">WARNING</span>
                          <span className="text-sm text-amber-900 dark:text-amber-100">{issue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No issues */}
            {critical.length === 0 && warnings.length === 0 && (
              <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">No critical issues detected</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Your schema meets all quality standards</p>
              </div>
            )}

            {/* AI Improvements */}
            {metrics.explanations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI Improvements Applied
                </h3>
                <div className="space-y-2">
                  {metrics.explanations.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="flex overflow-hidden rounded-xl border border-purple-200 dark:border-purple-800/50">
                      <div className="w-1.5 flex-shrink-0 bg-purple-500" />
                      <div className="flex-1 flex items-start gap-2.5 px-4 py-3 bg-purple-50 dark:bg-purple-950/10">
                        <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">{exp.action}</span>
                            <span className="text-xs font-mono text-neutral-400 truncate">{exp.path}</span>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{exp.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {metrics.appliedSuggestionsCount !== undefined && metrics.totalSuggestionsCount !== undefined && (
                  <div className="mt-3 flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">AI suggestions applied</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {metrics.appliedSuggestionsCount} / {metrics.totalSuggestionsCount}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <p className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              Report generated using deterministic quality evaluation â€¢ Scores update in real-time
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

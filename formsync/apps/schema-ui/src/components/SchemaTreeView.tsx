/**
 * Schema Tree View Component
 *
 * Displays JSON Schema as an interactive tree structure
 * with search and navigation capabilities
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, X, Type, Hash, ToggleLeft, List, Package, Circle, Network } from 'lucide-react';

interface TreeNode {
  path: string;
  key: string;
  value: any;
  type: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

interface SchemaTreeViewProps {
  schema: any;
  onSelectPath?: (path: string) => void;
  searchQuery?: string;
}

export const SchemaTreeView: React.FC<SchemaTreeViewProps> = ({
  schema,
  onSelectPath,
  searchQuery = '',
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
  const [internalSearch, setInternalSearch] = useState('');
  
  const searchTerm = searchQuery || internalSearch;

  // Build tree from schema
  const buildTree = (obj: any, parentPath = ''): TreeNode[] => {
    if (!obj || typeof obj !== 'object') return [];

    return Object.entries(obj).map(([key, value]: [string, any]) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      const type = Array.isArray(value) ? 'array' : typeof value;
      
      let children: TreeNode[] = [];
      if (type === 'object' && value !== null) {
        children = buildTree(value as Record<string, any>, path);
      } else if (type === 'array' && Array.isArray(value) && value.length > 0) {
        children = value.map((item: any, idx: number) => {
          const itemPath = `${path}[${idx}]`;
          if (typeof item === 'object' && item !== null) {
            return {
              path: itemPath,
              key: `[${idx}]`,
              value: item,
              type: 'object',
              children: buildTree(item, itemPath),
            };
          }
          return {
            path: itemPath,
            key: `[${idx}]`,
            value: item,
            type: typeof item,
          };
        });
      }

      return {
        path,
        key,
        value,
        type,
        children: children.length > 0 ? children : undefined,
      };
    });
  };

  const tree = useMemo(() => buildTree(schema), [schema]);

  // Filter tree by search
  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query) return nodes;
    
    return nodes.filter((node) => {
      const matchesSearch = 
        node.key.toLowerCase().includes(query.toLowerCase()) ||
        node.path.toLowerCase().includes(query.toLowerCase()) ||
        String(node.value).toLowerCase().includes(query.toLowerCase());

      const hasMatchingChildren = node.children && filterTree(node.children, query).length > 0;

      return matchesSearch || hasMatchingChildren;
    });
  };

  const filteredTree = useMemo(
    () => filterTree(tree, searchTerm),
    [tree, searchTerm]
  );

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  /* ── Type colour / badge config ─────────────────────────── */
  const TYPE_CONFIG: Record<string, { icon: React.ReactNode; pill: string; dot: string }> = {
    string:  { icon: <Type className="h-3.5 w-3.5" />,       pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    number:  { icon: <Hash className="h-3.5 w-3.5" />,       pill: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500'    },
    integer: { icon: <Hash className="h-3.5 w-3.5" />,       pill: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500'    },
    boolean: { icon: <ToggleLeft className="h-3.5 w-3.5" />, pill: 'bg-purple-100 text-purple-700 border-purple-200',    dot: 'bg-purple-500'  },
    array:   { icon: <List className="h-3.5 w-3.5" />,       pill: 'bg-orange-100 text-orange-700 border-orange-200',    dot: 'bg-orange-500'  },
    object:  { icon: <Package className="h-3.5 w-3.5" />,    pill: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400'   },
  };
  const getTypeCfg = (type: string) =>
    TYPE_CONFIG[type] ?? { icon: <Circle className="h-3.5 w-3.5" />, pill: 'bg-neutral-100 text-neutral-600 border-neutral-200', dot: 'bg-neutral-400' };

  const renderValue = (value: any, type: string) => {
    if (type === 'object' || type === 'array') return null;
    const str = String(value);
    return str.length > 45 ? `${str.slice(0, 45)}…` : str;
  };

  /* ── Recursive node renderer ─────────────────────────────── */
  const renderNode = (node: TreeNode, level = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 16;
    const cfg = getTypeCfg(node.type);
    const isHighlighted = searchTerm && (
      node.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(node.value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div key={node.path}>
        <div
          className={`group flex items-center gap-2 py-1.5 pr-3 rounded-lg cursor-pointer transition-colors ${
            isHighlighted
              ? 'bg-amber-50 border border-amber-200'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => {
            if (hasChildren) toggleExpand(node.path);
            onSelectPath?.(node.path);
          }}
        >
          {/* Chevron */}
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              <motion.span
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center"
              >
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600" />
              </motion.span>
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} opacity-60`} />
            )}
          </span>

          {/* Type icon */}
          <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded ${cfg.pill.split(' ').slice(0,2).join(' ')}`}>
            {cfg.icon}
          </span>

          {/* Key name */}
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
            {node.key}
          </span>

          {/* Type pill */}
          <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.pill}`}>
            {node.type}
          </span>

          {/* Primitive value */}
          {renderValue(node.value, node.type) && (
            <span className="ml-auto text-[11px] text-neutral-400 dark:text-neutral-500 font-mono truncate max-w-[120px]">
              {renderValue(node.value, node.type)}
            </span>
          )}
        </div>

        {/* Children — animated */}
        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              key="children"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
              style={{ borderLeft: `2px solid`, borderColor: 'transparent' }}
            >
              <div className="relative" style={{ marginLeft: `${indent + 20}px` }}>
                <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700" />
                {node.children!.map((child) => renderNode(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  /* ── Counts ──────────────────────────────────────────────── */
  const totalNodes = useMemo(() => {
    const count = (nodes: TreeNode[]): number =>
      nodes.reduce((acc, n) => acc + 1 + (n.children ? count(n.children) : 0), 0);
    return count(tree);
  }, [tree]);

  const expandAll = () => {
    const allPaths = new Set<string>();
    const collect = (nodes: TreeNode[]) =>
      nodes.forEach((n) => { allPaths.add(n.path); if (n.children) collect(n.children); });
    collect(tree);
    setExpandedPaths(allPaths);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Network className="h-4 w-4 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Schema Navigator</h2>
              <p className="text-[11px] text-neutral-400 leading-none">{totalNodes} properties</p>
            </div>
          </div>

        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search properties…"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          {internalSearch && (
            <button
              onClick={() => setInternalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Expand / Collapse buttons */}
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={expandAll}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedPaths(new Set())}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ── Tree ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredTree.length > 0 ? (
          <div className="space-y-0.5">
            {filteredTree.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Network className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">{searchTerm ? 'No matching properties found' : 'Schema is empty'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

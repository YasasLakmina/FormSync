/**
 * Schema Tree View Component
 * 
 * Displays JSON Schema as an interactive tree structure
 * with search and navigation capabilities
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight, Search, X, Type, Hash, ToggleLeft, List, Package, Circle } from 'lucide-react';

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

  const getTypeIcon = (type: string) => {
    const iconClass = "h-3.5 w-3.5";
    switch (type) {
      case 'string':
        return <Type className={iconClass} />;
      case 'number':
        return <Hash className={iconClass} />;
      case 'boolean':
        return <ToggleLeft className={iconClass} />;
      case 'array':
        return <List className={iconClass} />;
      case 'object':
        return <Package className={iconClass} />;
      default:
        return <Circle className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'text-green-600 dark:text-green-400';
      case 'number':
        return 'text-blue-600 dark:text-blue-400';
      case 'boolean':
        return 'text-purple-600 dark:text-purple-400';
      case 'array':
        return 'text-orange-600 dark:text-orange-400';
      case 'object':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const renderValue = (value: any, type: string) => {
    if (type === 'object' || type === 'array') return null;
    
    const str = String(value);
    if (str.length > 50) return `${str.slice(0, 50)}...`;
    return str;
  };

  const renderNode = (node: TreeNode, level = 0): React.ReactNode => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    const isHighlighted = searchTerm && node.path.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-accent/50 rounded cursor-pointer ${
            isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => {
            if (hasChildren) toggleExpand(node.path);
            onSelectPath?.(node.path);
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <span className="flex-shrink-0 w-4 h-4">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
          ) : (
            <span className="flex-shrink-0 w-4" />
          )}

          {/* Type Icon */}
          <span className={`flex-shrink-0 ${getTypeColor(node.type)}`}>{getTypeIcon(node.type)}</span>

          {/* Key */}
          <span className="font-medium text-sm">{node.key}</span>

          {/* Type Badge */}
          <span className={`text-xs ${getTypeColor(node.type)}`}>
            {node.type}
          </span>

          {/* Value (if primitive) */}
          {renderValue(node.value, node.type) && (
            <span className="text-xs text-muted-foreground ml-auto truncate">
              {renderValue(node.value, node.type)}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Schema Navigator</CardTitle>
        <CardDescription>Browse and search your schema structure</CardDescription>
        
        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {internalSearch && (
            <button
              onClick={() => setInternalSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Expand/Collapse All */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allPaths = new Set<string>();
              const collectPaths = (nodes: TreeNode[]) => {
                nodes.forEach((node) => {
                  allPaths.add(node.path);
                  if (node.children) collectPaths(node.children);
                });
              };
              collectPaths(tree);
              setExpandedPaths(allPaths);
            }}
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedPaths(new Set())}
          >
            Collapse All
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="max-h-[600px] overflow-y-auto border rounded-md p-2">
          {filteredTree.length > 0 ? (
            filteredTree.map((node) => renderNode(node))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No matching properties found' : 'Schema is empty'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

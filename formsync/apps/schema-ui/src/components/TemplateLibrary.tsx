/**
 * Template Library Component
 * 
 * Displays available schema templates in a grid layout
 * with search and category filtering
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { getAllTemplates, getTemplatesByCategory, searchTemplates, SchemaTemplate } from '../data/templates';
import { Search, X } from 'lucide-react';

interface TemplateLibraryProps {
  onSelectTemplate: (schema: any) => void;
  onClose: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getFilteredTemplates = (): SchemaTemplate[] => {
    let templates = getAllTemplates();

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory as any);
    }

    // Filter by search query
    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  };

  const templates = getFilteredTemplates();

  const categories = [
    { value: 'all', label: 'All Templates', count: getAllTemplates().length },
    { value: 'form', label: 'Forms', count: getTemplatesByCategory('form').length },
    { value: 'api', label: 'API', count: getTemplatesByCategory('api').length },
    { value: 'database', label: 'Database', count: getTemplatesByCategory('database').length },
    { value: 'general', label: 'General', count: getTemplatesByCategory('general').length },
  ];

  const handleSelectTemplate = (template: SchemaTemplate) => {
    onSelectTemplate(template.schema);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Schema Template Library</CardTitle>
              <CardDescription>Choose a pre-built template to get started quickly</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label} ({cat.count})
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1 pt-6">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{template.icon || '📄'}</div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {template.category.toUpperCase()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Schema preview info */}
                  <div className="mt-3 text-xs text-muted-foreground">
                    {Object.keys(template.schema.properties || {}).length} fields
                    {template.schema.required?.length > 0 && (
                      <span> • {template.schema.required.length} required</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {templates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No templates found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

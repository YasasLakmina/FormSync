/**
 * Template Library Component
 * 
 * Clean, minimal, professional template selector
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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

    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory as any);
    }

    if (searchQuery) {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  };

  const templates = getFilteredTemplates();

  const categories = [
    { value: 'all', label: 'All', count: getAllTemplates().length },
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 shadow-2xl rounded-xl animate-scaleIn overflow-hidden">
        {/* Header */}
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                Schema Templates
              </CardTitle>
              <CardDescription className="mt-1">Choose a template to get started</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[280px] relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cat.label} <span className="opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* Template Grid */}
        <CardContent className="overflow-y-auto flex-1 pt-6 px-6">
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <Card
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slideUp rounded-lg overflow-hidden group bg-white dark:bg-neutral-800"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                        {template.icon || '📄'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {template.name}
                        </CardTitle>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase mt-1 inline-block">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium text-neutral-500">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Schema Info */}
                    <div className="flex items-center gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-xs">
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        {Object.keys(template.schema.properties || {}).length} fields
                      </span>
                      {template.schema.required?.length > 0 && (
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {template.schema.required.length} required
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fadeIn">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No templates found</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};


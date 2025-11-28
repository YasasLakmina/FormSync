/**
 * Main App Component
 * 
 * Root component with tab navigation between Technical Editor and Template Builder
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { TechnicalEditor } from './components/TechnicalEditor';
import { TemplateBuilder } from './components/TemplateBuilder';
import { Code2, Wand2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">FormSync</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Component 1: Intelligent Schema Definition & AI Integration
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Research Project</div>
              <div className="text-xs">JSON Schema Draft-7</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Technical Editor
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Template Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="technical" className="min-h-[600px]">
            <TechnicalEditor />
          </TabsContent>

          <TabsContent value="builder" className="min-h-[600px]">
            <TemplateBuilder />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>FormSync - Dual-path schema creation with plugin architecture and AI integration</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

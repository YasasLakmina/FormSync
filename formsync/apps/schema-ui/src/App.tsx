/**
 * Main App Component with Routing
 * 
 * Premium UI with landing page and editor navigation
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { TechnicalEditor } from './components/TechnicalEditor';
import { TemplateBuilder } from './components/TemplateBuilder';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Code2, Wand2 } from 'lucide-react';

// Editor Page Component
const EditorPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Schema Editor
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Create, convert, and enhance your JSON schemas with AI assistance
            </p>
          </div>

          <Tabs defaultValue="technical" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Technical Editor
              </TabsTrigger>
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Template Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="fade-in-up">
              <TechnicalEditor />
            </TabsContent>

            <TabsContent value="builder" className="fade-in-up">
              <TemplateBuilder />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

function App() {
  return (
    <>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route 
              path="/" 
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              } 
            />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
      />
    </>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';
import { GeneratedCodePage } from './pages/GeneratedCodePage';
import { Documentation } from './components/Documentation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

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
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/generated" element={<GeneratedCodePage />} />
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

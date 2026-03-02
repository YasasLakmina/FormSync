import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';
import { GeneratedCodePage } from './pages/GeneratedCodePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { Documentation } from './components/Documentation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/layout/PageTransition';

// Lazy-load the Builder page so its CSS doesn't bleed into the rest of the app
const BuilderPage = lazy(() => import('./pages/BuilderPage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Builder route — full-screen, no Navbar/Footer */}
          <Route
            path="/builder"
            element={
              <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading Builder...</div>}>
                <BuilderPage />
              </Suspense>
            }
          />

          {/* Schema UI routes — with Navbar/Footer */}
          <Route path="/*" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                <Route path="/editor" element={<><EditorPage /><Footer /></>} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/generated" element={<><GeneratedCodePage /><Footer /></>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          } />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
      </Router>
    </AuthProvider>
  );
}

export default App;


import React from 'react';
import { Link } from 'react-router-dom';
import { Github, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 px-4 py-10 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-6">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 w-fit">
              <img src="/logo.png" alt="FormSync Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              AI-powered schema automation platform. Transform JSON schemas into production-ready
              applications.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Product</h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/editor" className="hover:text-purple-600 transition-colors">
                  Editor
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-purple-600 transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-purple-600 transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="https://github.com/formsync"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-600 transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              <li>
                <Link
                  to="/documentation"
                  className="hover:text-purple-600 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" /> Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          <p>© 2026 FormSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

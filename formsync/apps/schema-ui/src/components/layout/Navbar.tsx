import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, FileCode, BookOpen, Github, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/editor', label: 'Schema Editor', icon: Code2 },
    { path: '/docs', label: 'Documentation', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FileCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FormSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant="ghost"
                    className={`gap-2 ${
                      isActive(link.path)
                        ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}

            <a
              href="https://github.com/yourusername/formsync"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <Button variant="ghost" size="icon" className="text-neutral-600 dark:text-neutral-400">
                <Github className="h-5 w-5" />
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-2 ${
                        isActive(link.path)
                          ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              <a
                href="https://github.com/yourusername/formsync"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

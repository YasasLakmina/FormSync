import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, BookOpen, Github, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/editor', label: 'Schema Editor', icon: Code2 },
    { path: '/documentation', label: 'Documentation', icon: BookOpen },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="FormSync Logo"
              className="h-12 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant="ghost"
                    className={`gap-2 ${isActive(link.path)
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
              className="ml-1"
            >
              <Button variant="ghost" size="icon" className="text-neutral-600 dark:text-neutral-400">
                <Github className="h-5 w-5" />
              </Button>
            </a>

            {/* Auth Section */}
            <div className="ml-2 flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-700">
              {user ? (
                <>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      className={`gap-2 ${isActive('/profile')
                          ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400'
                        }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-xs font-bold text-purple-600 dark:text-purple-400">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate">{user.name || user.email.split('@')[0]}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-neutral-600 dark:text-neutral-400">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                      <User className="h-4 w-4" />
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
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
                      className={`w-full justify-start gap-2 ${isActive(link.path)
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

              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-neutral-600 dark:text-neutral-400">
                      <User className="h-4 w-4" />
                      {user.name || user.email}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-neutral-600 dark:text-neutral-400">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, BookOpen, Menu, X, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/editor', label: 'Schema Editor', icon: Code2 },
    { path: '/documentation', label: 'Documentation', icon: BookOpen },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarInitial = user ? (user.name || user.email)[0].toUpperCase() : '';
  const displayName = user ? (user.name || user.email.split('@')[0]) : '';

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

            {/* Auth Section */}
            <div className="ml-3 flex items-center pl-3 border-l border-neutral-200 dark:border-neutral-700">
              {user ? (
                /* ── Profile Dropdown ── */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen((o) => !o)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 select-none
                      ${profileDropdownOpen
                        ? 'bg-purple-50 dark:bg-purple-950/30 ring-1 ring-purple-200 dark:ring-purple-800'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm flex-shrink-0">
                      {avatarInitial}
                    </div>
                    {/* Name */}
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 max-w-[120px] truncate">
                        {displayName}
                      </span>
                      {user.name && (
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 max-w-[120px] truncate mt-0.5">
                          {user.email}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
                        profileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Panel */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-200/60 dark:shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Identity Header */}
                      <div className="px-4 py-3.5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-base font-bold text-white shadow-sm flex-shrink-0">
                            {avatarInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                        >
                          <Settings className="h-4 w-4 text-neutral-400 group-hover:text-purple-500 transition-colors" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      {/* Divider + Sign Out */}
                      <div className="border-t border-neutral-100 dark:border-neutral-800 p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
                        >
                          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-neutral-600 dark:text-neutral-400">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 ml-1">
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
            <div className="flex flex-col gap-1">
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
                  {/* Mobile user identity */}
                  <div className="flex items-center gap-3 px-3 py-3 mt-1 mx-0.5 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0">
                      {avatarInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate">{displayName}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-neutral-600 dark:text-neutral-400">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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

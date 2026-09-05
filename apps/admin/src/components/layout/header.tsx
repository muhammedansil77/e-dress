'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/auth-context';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Search,
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { admin, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Default to clean light (white) theme unless explicitly set to 'dark'
    if (localStorage.theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'indigo';
      case 'ADMIN':
        return 'info';
      case 'MANAGER':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-cream-400 bg-cream-50/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left items: Mobile toggle & Global search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-coffee-600 hover:bg-cream-200 hover:text-coffee-900 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-600" />
          <input
            type="text"
            placeholder="Search catalog, orders, SKUs..."
            className="w-full rounded-xl border border-cream-400 bg-cream-100 py-1.5 pl-9 pr-3 text-xs text-coffee-900 placeholder:text-coffee-600/70 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all"
          />
        </div>
      </div>

      {/* Right items: Actions, Theme, User */}
      <div className="flex items-center gap-2.5">
        {/* Notifications */}
        <button
          title="Notifications"
          className="relative rounded-xl p-2 text-coffee-600 hover:bg-cream-200 hover:text-coffee-900 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500 ring-2 ring-cream-50" />
        </button>

        <div className="h-5 w-[1px] bg-cream-400 mx-1" />

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-cream-200/70 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-coffee-700 border border-gold-500/30 flex items-center justify-center text-cream-50 font-bold text-xs shadow-sm">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-coffee-900 leading-tight">
                {admin?.name || 'Admin User'}
              </span>
              <span className="block text-[10px] text-coffee-600 font-medium">
                {admin?.email || 'admin@apparels.com'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-coffee-600" />
          </button>

          {/* Menu dropdown */}
          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-cream-50 shadow-xl border border-cream-400 py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-cream-300">
                  <p className="text-xs font-semibold text-coffee-900">{admin?.name}</p>
                  <p className="text-[11px] text-coffee-600 truncate">{admin?.email}</p>
                  <div className="mt-1.5">
                    <Badge variant={getRoleVariant(admin?.role)} size="sm">
                      {admin?.role || 'ADMIN'}
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1.5 text-[11px] text-coffee-600 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-gold-500" />
                    <span>Active Session</span>
                  </div>
                </div>

                <div className="border-t border-cream-300 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

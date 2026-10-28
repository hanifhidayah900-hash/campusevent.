import React, { useState } from 'react';
import { Calendar, User, LogOut, LayoutDashboard, Database, Menu, X, ShieldCheck } from 'lucide-react';
import { Profile } from '../../types/database';
import { isSupabaseConfigured } from '../../lib/supabase';

interface NavbarProps {
  currentUser: Profile | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenDbSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onLogout,
  onOpenDbSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          
          {/* Zone 1: Wordmark Brand */}
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                CampusEvent
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-normal tracking-wide">
                Portal Event Mahasiswa
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => handleNavClick('landing')}
              className={`hover:text-white transition-colors whitespace-nowrap py-1 ${
                currentView === 'landing' ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`hover:text-white transition-colors whitespace-nowrap py-1 ${
                currentView === 'explore' ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              Jelajahi Event
            </button>
            <button
              onClick={() => {
                handleNavClick('landing');
                setTimeout(() => {
                  document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-white transition-colors whitespace-nowrap py-1"
            >
              Tentang
            </button>
            <button
              onClick={() => {
                handleNavClick('landing');
                setTimeout(() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-white transition-colors whitespace-nowrap py-1"
            >
              FAQ
            </button>
          </nav>

          {/* Zone 3: Actions & Auth */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Database Engine Status Button */}
            <button
              onClick={onOpenDbSettings}
              title="Konfigurasi Database Supabase / PostgreSQL"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Database Aktif'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard {currentUser.role === 'admin' ? 'Admin' : 'Mahasiswa'}</span>
                </button>
                <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />
                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-colors whitespace-nowrap"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('landing')}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentView === 'landing' ? 'bg-slate-800 text-blue-400' : 'text-slate-200'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('explore')}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentView === 'explore' ? 'bg-slate-800 text-blue-400' : 'text-slate-200'
              }`}
            >
              Jelajahi Event
            </button>
            <button
              onClick={() => {
                handleNavClick('landing');
                setTimeout(() => {
                  document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200"
            >
              Tentang
            </button>
            <button
              onClick={() => {
                handleNavClick('landing');
                setTimeout(() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-left px-3 py-2 rounded-md text-sm font-medium text-slate-200"
            >
              FAQ
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                onOpenDbSettings();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-slate-800/80 text-xs text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Status Database: {isSupabaseConfigured ? 'Supabase Live' : 'Penyimpanan Lokal'}
              </span>
              <span className="text-blue-400">Atur</span>
            </button>

            {currentUser ? (
              <div className="space-y-2 pt-1">
                <div className="px-3 py-1.5 bg-slate-800 rounded-md">
                  <p className="text-xs font-semibold text-white">{currentUser.full_name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser.email} ({currentUser.role})</p>
                </div>
                <button
                  onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                  className="w-full py-2 px-3 text-center rounded-md bg-blue-600 text-white font-medium text-sm"
                >
                  Buka Dashboard
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-center rounded-md border border-slate-700 text-slate-300 font-medium text-sm"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-center rounded-md bg-slate-800 text-white font-medium text-sm"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 text-center rounded-md bg-blue-600 text-white font-medium text-sm"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

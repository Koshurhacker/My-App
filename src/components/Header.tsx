import React from 'react';
import { Film, Search, Bookmark, Shield, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  currentUser: User | null;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenViewerLogin: () => void;
  onLogoutAdmin: () => void;
  onLogoutViewer: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  isAdmin,
  onOpenAdminLogin,
  onOpenViewerLogin,
  onLogoutAdmin,
  onLogoutViewer,
  bookmarkCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="vudoindia-brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent group-hover:text-pink-400 transition-colors">
              vudoindia
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-pink-400 -mt-1 uppercase">
              Micro Dramas
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'home'
                ? 'text-white bg-white/10 font-semibold shadow-inner'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('micro-dramas')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'micro-dramas'
                ? 'text-white bg-white/10 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Micro Dramas
          </button>
          <button
            onClick={() => onNavigate('series')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'series'
                ? 'text-white bg-white/10 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
              currentView === 'search'
                ? 'text-white bg-white/10 font-semibold'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4 text-neutral-400" />
            <span>Search</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button (Mobile/Tablet) */}
          <button
            onClick={() => onNavigate('search')}
            className="md:hidden p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Bookmarks / Watchlist Button */}
          <button
            onClick={() => onNavigate('bookmarks')}
            className={`relative p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors ${
              currentView === 'bookmarks' ? 'text-pink-400 bg-pink-500/10' : ''
            }`}
            title="Saved Dramas"
          >
            <Bookmark className="w-5 h-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Viewer Account / Profile */}
          {currentUser ? (
            <div className="relative group">
              <button 
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
              >
                <img
                  src={currentUser.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full ring-1 ring-pink-500/50 object-cover"
                />
                <span className="text-xs font-medium hidden sm:inline-block max-w-[100px] truncate">
                  {currentUser.name}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenViewerLogin}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Creator / Admin Portal Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
                  currentView === 'admin'
                    ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-pink-500/30'
                    : 'bg-gradient-to-r from-pink-600/80 to-amber-600/80 text-white hover:opacity-95'
                }`}
                id="header-admin-studio-btn"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Creator Studio</span>
                <span className="sm:hidden">Studio</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Exit Creator Studio"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-amber-400 hover:bg-amber-400/5 border border-transparent hover:border-amber-500/20 transition-all"
              title="Creator Login"
              id="header-creator-login-btn"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline text-[11px]">Creator</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

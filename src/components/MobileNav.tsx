import React from 'react';
import { Home, Film, Search, Tv, User, Shield } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, isAdmin }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0e12]/95 backdrop-blur-lg border-t border-white/10 px-3 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-pink-500 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
          id="mobile-nav-home"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        <button
          onClick={() => onNavigate('micro-dramas')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentView === 'micro-dramas' ? 'text-pink-500 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
          id="mobile-nav-dramas"
        >
          <Film className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Dramas</span>
        </button>

        <button
          onClick={() => onNavigate('search')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentView === 'search' ? 'text-pink-500 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
          id="mobile-nav-search"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        <button
          onClick={() => onNavigate('series')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentView === 'series' ? 'text-pink-500 font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
          id="mobile-nav-series"
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Series</span>
        </button>

        {isAdmin ? (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-amber-500/80 hover:text-amber-300'
            }`}
            id="mobile-nav-admin"
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Studio</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              currentView === 'profile' ? 'text-pink-500 font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
            id="mobile-nav-profile"
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>
        )}
      </div>
    </nav>
  );
};

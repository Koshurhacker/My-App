import React, { useState } from 'react';
import { User, X, Check, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';

interface ViewerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const ViewerAuthModal: React.FC<ViewerAuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = await api.loginViewer(name.trim(), email.trim() || undefined);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      console.error('Viewer login failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = (quickName: string, quickEmail: string) => {
    setName(quickName);
    setEmail(quickEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121318] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-600/30">
            <User className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-xl text-white">Viewer Profile</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in to keep your watchlist synced and participate in comments
          </p>
        </div>

        {/* Quick Profiles */}
        <div className="mb-5">
          <span className="text-[11px] text-neutral-400 block mb-2 font-semibold uppercase tracking-wider">
            Quick Viewer Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoUser('Ananya Verma', 'ananya@example.com')}
              className="p-2 rounded-xl bg-neutral-900 border border-white/5 hover:border-pink-500/30 text-left text-xs text-neutral-300 hover:text-white transition-colors"
            >
              <div className="font-bold">Ananya Verma</div>
              <div className="text-[10px] text-neutral-500">Drama enthusiast</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoUser('Rohan Kapoor', 'rohan@example.com')}
              className="p-2 rounded-xl bg-neutral-900 border border-white/5 hover:border-pink-500/30 text-left text-xs text-neutral-300 hover:text-white transition-colors"
            >
              <div className="font-bold">Rohan Kapoor</div>
              <div className="text-[10px] text-neutral-500">Thriller fan</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Email Address (Optional)</label>
            <input
              type="email"
              placeholder="priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-pink-600/30 disabled:opacity-50"
            id="viewer-signin-submit-btn"
          >
            {loading ? 'Signing in...' : 'Enter as Viewer'}
          </button>
        </form>
      </div>
    </div>
  );
};

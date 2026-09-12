import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Film,
  Tv,
  UploadCloud,
  MessageSquare,
  RefreshCw,
  Trash2,
  ExternalLink,
  Shield,
  LogOut,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Series, Episode, AdminStats } from '../../types';
import { api } from '../../services/api';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSeriesManager } from './AdminSeriesManager';
import { AdminEpisodeManager } from './AdminEpisodeManager';
import { AdminUploadWizard } from './AdminUploadWizard';
import { AdminCommentsManager } from './AdminCommentsManager';

interface AdminDashboardProps {
  onBackToPublic: () => void;
  onLogout: () => void;
  onPreviewEpisode: (episode: Episode, series: Series) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToPublic,
  onLogout,
  onPreviewEpisode,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'wizard' | 'series' | 'episodes' | 'comments'>('analytics');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [statsData, seriesData] = await Promise.all([
        api.getAdminStats(),
        api.getSeries(true), // include all
      ]);
      setStats(statsData);
      setSeriesList(seriesData);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset content to the 3 fictional sample micro-dramas (The Last Promise, Midnight in Mumbai, Love at First Beat)?')) return;
    try {
      await api.resetDemoData();
      setActionNotice('Reset to 3 sample micro-dramas successful!');
      setTimeout(() => setActionNotice(''), 3000);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Warning: This will delete all sample content and clear the database so you can start uploading your own brand new videos from scratch. Continue?')) return;
    try {
      await api.clearAllContent();
      setActionNotice('All catalog content cleared. You can now start fresh!');
      setTimeout(() => setActionNotice(''), 3000);
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-24" id="admin-dashboard-page">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#121318]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white">vudoindia Studio</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                  Creator Owner
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Content Management & Streaming Control</p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors border border-white/5"
              title="Reset to 3 sample micro-dramas"
              id="admin-reset-demo-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
              <span>Reset Demo</span>
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors border border-rose-500/20"
              title="Delete all demo videos and start blank"
              id="admin-clear-all-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>

            <button
              onClick={onBackToPublic}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              id="admin-view-public-btn"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Logout from Studio"
              id="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wizard'
                ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <span>Upload Wizard</span>
          </button>

          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'series'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Series Catalog ({seriesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('episodes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'episodes'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Episodes & Seasons</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'comments'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments Moderation</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === 'analytics' && <AdminAnalytics stats={stats} />}

          {activeTab === 'wizard' && (
            <AdminUploadWizard
              existingSeries={seriesList}
              onComplete={() => {
                refreshData();
                setActiveTab('episodes');
              }}
            />
          )}

          {activeTab === 'series' && (
            <AdminSeriesManager seriesList={seriesList} onRefresh={refreshData} />
          )}

          {activeTab === 'episodes' && (
            <AdminEpisodeManager
              seriesList={seriesList}
              onRefresh={refreshData}
              onPreviewEpisode={onPreviewEpisode}
            />
          )}

          {activeTab === 'comments' && <AdminCommentsManager />}
        </div>
      </div>
    </div>
  );
};

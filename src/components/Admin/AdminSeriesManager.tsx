import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Check, X, Flame, Star, Sparkles, Eye, Tv } from 'lucide-react';
import { Series } from '../../types';
import { api } from '../../services/api';

interface AdminSeriesManagerProps {
  seriesList: Series[];
  onRefresh: () => void;
}

export const AdminSeriesManager: React.FC<AdminSeriesManagerProps> = ({ seriesList, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('Romance, Drama');
  const [language, setLanguage] = useState('Hindi');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [status, setStatus] = useState<'Coming Soon' | 'Ongoing' | 'Completed'>('Ongoing');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewRelease, setIsNewRelease] = useState(true);
  const [homepageOrder, setHomepageOrder] = useState(1);

  const openCreateModal = () => {
    setEditingSeries(null);
    setTitle('');
    setDescription('');
    setGenres('Romance, Drama');
    setLanguage('Hindi');
    setDirector('Vikramaditya Sengupta');
    setCast('Aarav Kapoor, Priya Sharma');
    setPosterUrl('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80');
    setBannerUrl('https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&auto=format&fit=crop&q=80');
    setStatus('Ongoing');
    setIsFeatured(false);
    setIsTrending(false);
    setIsNewRelease(true);
    setHomepageOrder(seriesList.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Series) => {
    setEditingSeries(s);
    setTitle(s.title);
    setDescription(s.description);
    setGenres(s.genres.join(', '));
    setLanguage(s.language);
    setDirector(s.director);
    setCast(s.cast?.join(', ') || '');
    setPosterUrl(s.posterUrl);
    setBannerUrl(s.bannerUrl);
    setStatus(s.status);
    setIsFeatured(!!s.isFeatured);
    setIsTrending(!!s.isTrending);
    setIsNewRelease(!!s.isNewRelease);
    setHomepageOrder(s.homepageOrder || 1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const genreList = genres.split(',').map((g) => g.trim()).filter(Boolean);
    const castList = cast.split(',').map((c) => c.trim()).filter(Boolean);

    const payload = {
      title,
      description,
      genres: genreList,
      language,
      director,
      cast: castList,
      posterUrl,
      bannerUrl,
      status,
      isFeatured,
      isTrending,
      isNewRelease,
      homepageOrder: Number(homepageOrder) || 1,
    };

    try {
      if (editingSeries) {
        await api.updateSeries(editingSeries.id, payload);
      } else {
        await api.createSeries(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save series', err);
      alert('Error saving series');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all its seasons and episodes?`)) return;
    try {
      await api.deleteSeries(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete series', err);
    }
  };

  const toggleFeatured = async (s: Series) => {
    try {
      await api.updateSeries(s.id, { isFeatured: !s.isFeatured });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTrending = async (s: Series) => {
    try {
      await api.updateSeries(s.id, { isTrending: !s.isTrending });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Series Catalog</h2>
          <p className="text-xs text-neutral-400">Manage all your micro-drama series, spotlights, and genres.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:brightness-110 text-white text-xs font-bold transition-all shadow-md"
          id="admin-add-series-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Series</span>
        </button>
      </div>

      {/* Series Table / Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesList.map((s) => (
          <div
            key={s.id}
            className="p-4 rounded-2xl bg-[#121318] border border-white/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-3 mb-3">
                <img
                  src={s.posterUrl}
                  alt={s.title}
                  className="w-16 h-24 object-cover rounded-xl flex-shrink-0 bg-neutral-900 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 font-medium">
                      {s.language}
                    </span>
                    <span className="text-[10px] text-pink-400 font-bold">
                      {s.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{s.title}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">{s.description}</p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {s.seasons?.length || 1} Season • {s.totalEpisodes || s.episodes?.length || 0} Episodes
                  </p>
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="flex items-center gap-2 mb-4 pt-2 border-t border-white/5">
                <button
                  onClick={() => toggleFeatured(s)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    s.isFeatured
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                  title="Toggle Hero Spotlight"
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>Hero Featured</span>
                </button>

                <button
                  onClick={() => toggleTrending(s)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    s.isTrending
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                  title="Toggle Trending"
                >
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Trending</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[11px] text-neutral-400 font-mono">
                Order: #{s.homepageOrder || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Edit Series"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.title)}
                  className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Series"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Series Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#121318] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingSeries ? `Edit Series: ${editingSeries.title}` : 'Create New Micro Drama Series'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Description / Logline</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    placeholder="Romance, Drama, Thriller"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Homepage Order</label>
                  <input
                    type="number"
                    min="1"
                    value={homepageOrder}
                    onChange={(e) => setHomepageOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Director</label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Cast (comma-separated)</label>
                  <input
                    type="text"
                    value={cast}
                    onChange={(e) => setCast(e.target.value)}
                    placeholder="Actor 1, Actor 2"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Vertical Poster URL (2:3)</label>
                  <input
                    type="url"
                    required
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Banner Backdrop URL (16:9)</label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded accent-pink-600"
                  />
                  <span className="font-semibold text-neutral-300">Feature on Hero Banner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded accent-pink-600"
                  />
                  <span className="font-semibold text-neutral-300">Trending Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold"
                >
                  Save Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

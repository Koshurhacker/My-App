import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  MoveUp,
  MoveDown,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  Eye,
  Video,
} from 'lucide-react';
import { Series, Episode, Season } from '../../types';
import { api } from '../../services/api';

interface AdminEpisodeManagerProps {
  seriesList: Series[];
  onRefresh: () => void;
  onPreviewEpisode: (episode: Episode, series: Series) => void;
}

export const AdminEpisodeManager: React.FC<AdminEpisodeManagerProps> = ({
  seriesList,
  onRefresh,
  onPreviewEpisode,
}) => {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(seriesList[0]?.id || '');
  const selectedSeries = seriesList.find((s) => s.id === selectedSeriesId) || seriesList[0];

  const seasons = selectedSeries?.seasons || [];
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(seasons[0]?.id || '');

  const episodes = (selectedSeries?.episodes || []).filter(
    (e) => !selectedSeasonId || e.seasonId === selectedSeasonId || seasons.length <= 1
  ).sort((a, b) => a.orderIndex - b.orderIndex);

  // Add/Edit Episode Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState(180);
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>('Published');
  const [isFeatured, setIsFeatured] = useState(false);

  // Season addition
  const [newSeasonTitle, setNewSeasonTitle] = useState('');
  const [isAddingSeason, setIsAddingSeason] = useState(false);

  const openCreateModal = () => {
    setEditingEpisode(null);
    setTitle(`Episode ${episodes.length + 1}`);
    setEpisodeNumber(episodes.length + 1);
    setDescription('');
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    setThumbnailUrl('https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80');
    setDuration(180);
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setStatus('Published');
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (ep: Episode) => {
    setEditingEpisode(ep);
    setTitle(ep.title);
    setEpisodeNumber(ep.episodeNumber);
    setDescription(ep.description);
    setVideoUrl(ep.videoUrl);
    setThumbnailUrl(ep.thumbnailUrl);
    setDuration(ep.duration);
    setReleaseDate(ep.releaseDate);
    setStatus(ep.status);
    setIsFeatured(!!ep.isFeatured);
    setIsModalOpen(true);
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;

    const min = Math.floor(duration / 60);
    const sec = duration % 60;
    const durationFormatted = `${min}m ${sec.toString().padStart(2, '0')}s`;

    const payload = {
      seriesId: selectedSeries.id,
      seasonId: selectedSeasonId || seasons[0]?.id || 'season-1',
      title,
      episodeNumber: Number(episodeNumber),
      description,
      videoUrl,
      thumbnailUrl,
      duration: Number(duration),
      durationFormatted,
      releaseDate,
      status,
      isFeatured,
    };

    try {
      if (editingEpisode) {
        await api.updateEpisode(editingEpisode.id, payload);
      } else {
        await api.createEpisode(payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to save episode', err);
      alert('Error saving episode');
    }
  };

  const handleDeleteEpisode = async (id: string, epTitle: string) => {
    if (!confirm(`Delete episode "${epTitle}"?`)) return;
    try {
      await api.deleteEpisode(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete episode', err);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= episodes.length) return;

    const reordered = [...episodes];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((e) => e.id);
    const seasonId = selectedSeasonId || seasons[0]?.id || 'season-1';

    try {
      await api.reorderEpisodes(seasonId, orderedIds);
      onRefresh();
    } catch (err) {
      console.error('Failed to reorder episodes', err);
    }
  };

  const handleCreateSeason = async () => {
    if (!newSeasonTitle.trim() || !selectedSeries) return;
    try {
      await api.createSeason(selectedSeries.id, newSeasonTitle.trim());
      setNewSeasonTitle('');
      setIsAddingSeason(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create season', err);
    }
  };

  return (
    <div>
      {/* Series & Season Selection Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Select Series
            </label>
            <select
              value={selectedSeriesId}
              onChange={(e) => {
                setSelectedSeriesId(e.target.value);
                const ser = seriesList.find((s) => s.id === e.target.value);
                setSelectedSeasonId(ser?.seasons?.[0]?.id || '');
              }}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-pink-500"
            >
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {seasons.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                Select Season
              </label>
              <select
                value={selectedSeasonId}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-pink-500"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Add Season */}
          <div className="self-end">
            {isAddingSeason ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Season 2"
                  value={newSeasonTitle}
                  onChange={(e) => setNewSeasonTitle(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs text-white"
                />
                <button
                  onClick={handleCreateSeason}
                  className="px-2.5 py-1.5 rounded-lg bg-pink-600 text-xs font-bold text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsAddingSeason(false)}
                  className="px-2 py-1.5 text-neutral-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSeason(true)}
                className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 border border-white/10 flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>+ Season</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Episode Button */}
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-xs shadow-md hover:brightness-110 self-start lg:self-auto"
          id="admin-add-episode-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add Episode</span>
        </button>
      </div>

      {/* Episode List with Reorder Controls */}
      {episodes.length === 0 ? (
        <div className="text-center py-16 bg-[#121318] rounded-2xl border border-white/5">
          <p className="text-sm font-semibold text-neutral-300">No episodes in this season yet.</p>
          <p className="text-xs text-neutral-500 mt-1">Click "Add Episode" above to upload your first episode.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep, idx) => (
            <div
              key={ep.id}
              className="p-3.5 rounded-xl bg-[#121318] border border-white/5 flex items-center justify-between gap-4 hover:border-pink-500/20 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5 text-neutral-500">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === episodes.length - 1}
                    className="p-1 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10">
                  <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] text-white">
                    {ep.durationFormatted}
                  </span>
                </div>

                {/* Title & Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-pink-400">
                      EP {ep.episodeNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      ep.status === 'Published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : ep.status === 'Draft'
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ep.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate mt-0.5">{ep.title}</h4>
                  <p className="text-xs text-neutral-400 truncate max-w-md">{ep.description}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => selectedSeries && onPreviewEpisode(ep, selectedSeries)}
                  className="p-2 text-neutral-400 hover:text-pink-400 hover:bg-white/5 rounded-lg transition-colors"
                  title="Preview Episode"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(ep)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Edit Episode"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEpisode(ep.id, ep.title)}
                  className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Episode"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Episode Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#121318] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingEpisode ? `Edit Episode: ${editingEpisode.title}` : 'Add Episode'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Episode Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Episode Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Video Stream URL (MP4/HLS)</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  required
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    min="10"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 180)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">Release Date</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
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
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
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
                  Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

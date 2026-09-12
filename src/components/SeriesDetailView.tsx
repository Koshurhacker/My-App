import React, { useState } from 'react';
import { Play, Plus, Check, Share2, Clock, Calendar, Film, ArrowLeft, Tv, Star, User } from 'lucide-react';
import { Series, Episode, Season } from '../types';
import { EpisodeCard } from './EpisodeCard';

interface SeriesDetailViewProps {
  series: Series;
  onBack: () => void;
  onPlayEpisode: (episode: Episode, series: Series) => void;
  isBookmarked: boolean;
  onToggleBookmark: (seriesId: string) => void;
  onOpenShare: (series: Series, episode?: Episode) => void;
}

export const SeriesDetailView: React.FC<SeriesDetailViewProps> = ({
  series,
  onBack,
  onPlayEpisode,
  isBookmarked,
  onToggleBookmark,
  onOpenShare,
}) => {
  const seasons = series.seasons && series.seasons.length > 0 ? series.seasons : [
    { id: 'season-default', seriesId: series.id, seasonNumber: 1, title: 'Season 1', orderIndex: 1 }
  ];

  const [activeSeasonId, setActiveSeasonId] = useState<string>(seasons[0]?.id || '');

  // Filter episodes for active season
  const currentSeasonEpisodes = (series.episodes || []).filter(
    (e) => (e.seasonId === activeSeasonId || seasons.length <= 1) && e.status === 'Published'
  ).sort((a, b) => a.orderIndex - b.orderIndex);

  const firstEpisode = currentSeasonEpisodes[0] || series.episodes?.[0];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-24">
      {/* Hero Header with Backdrop */}
      <div className="relative w-full min-h-[420px] md:min-h-[500px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={series.bannerUrl || series.posterUrl}
            alt={series.title}
            className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/70 to-transparent" />
        </div>

        {/* Back navigation button */}
        <div className="absolute top-4 left-4 sm:left-8 z-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white transition-all shadow-lg"
            id="series-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse</span>
          </button>
        </div>

        {/* Series Metadata Card */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-20 w-full">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
            
            {/* Vertical Poster (2:3 aspect) */}
            <div className="w-36 sm:w-48 lg:w-56 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
              <img
                src={series.posterUrl}
                alt={series.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-600/90 text-white text-[11px] font-bold uppercase tracking-wider">
                  Micro Drama
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-neutral-300 text-xs font-semibold">
                  {series.status}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">
                  {series.language}
                </span>
                <span className="text-xs text-neutral-400">
                  {series.releaseDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                {series.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs sm:text-sm text-neutral-300">
                {series.genres?.map((g) => (
                  <span key={g} className="px-2.5 py-1 rounded-lg bg-neutral-800/80 border border-white/5 font-medium">
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-3xl mb-6">
                {series.description}
              </p>

              {/* Cast & Crew */}
              <div className="space-y-1.5 text-xs text-neutral-400 mb-6">
                <div>
                  <span className="text-neutral-200 font-semibold">Director:</span>{' '}
                  <span className="text-pink-400">{series.director}</span>
                </div>
                {series.cast && series.cast.length > 0 && (
                  <div>
                    <span className="text-neutral-200 font-semibold">Starring:</span>{' '}
                    <span>{series.cast.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {firstEpisode && (
                  <button
                    onClick={() => onPlayEpisode(firstEpisode, series)}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pink-600/30"
                    id="series-watch-now-btn"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Ep 1 — {firstEpisode.title}</span>
                  </button>
                )}

                <button
                  onClick={() => onToggleBookmark(series.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                    isBookmarked
                      ? 'bg-pink-600/20 text-pink-400 border-pink-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  id="series-bookmark-btn"
                >
                  {isBookmarked ? (
                    <>
                      <Check className="w-4 h-4 text-pink-400" />
                      <span>In Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to List</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenShare(series)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-white/10 text-xs font-semibold transition-colors"
                  id="series-share-btn"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Series</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Episodes</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {currentSeasonEpisodes.length} episodes available
            </p>
          </div>

          {/* Season Selector Tabs */}
          {seasons.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setActiveSeasonId(season.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeSeasonId === season.id
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-white/10'
                  }`}
                >
                  {season.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Episodes Grid */}
        {currentSeasonEpisodes.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-white/5">
            <Tv className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-300">
              No published episodes in this season yet.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Check back soon as the creator uploads more micro episodes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentSeasonEpisodes.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                series={series}
                onPlay={(selectedEp) => onPlayEpisode(selectedEp, series)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

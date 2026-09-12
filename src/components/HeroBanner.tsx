import React from 'react';
import { Play, Plus, Check, Info, Flame, Sparkles } from 'lucide-react';
import { Series, Episode } from '../types';

interface HeroBannerProps {
  series: Series | null;
  onWatchEpisode: (episode: Episode, series: Series) => void;
  onOpenSeries: (series: Series) => void;
  isBookmarked: boolean;
  onToggleBookmark: (seriesId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  series,
  onWatchEpisode,
  onOpenSeries,
  isBookmarked,
  onToggleBookmark,
}) => {
  if (!series) return null;

  // Pick first published episode or trailer for instant play
  const firstEpisode = series.episodes?.find(e => e.status === 'Published') || series.episodes?.[0];

  return (
    <div className="relative w-full min-h-[460px] md:min-h-[540px] lg:min-h-[600px] flex items-end overflow-hidden select-none">
      {/* Background Cinematic Image with Rich Gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={series.bannerUrl || series.posterUrl}
          alt={series.title}
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-[0.75] contrast-[1.1] transition-transform duration-1000 ease-out"
        />
        {/* Layered OTT Gradients for pristine text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent w-full md:w-3/4" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0a0a0c]/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 w-full">
        <div className="max-w-2xl">
          {/* Badge & Metadata */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-pink-600/30">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Featured Micro Drama
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs font-medium backdrop-blur-sm">
              {series.language}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs font-medium">
              {series.totalEpisodes || series.episodes?.length || 5} Episodes
            </span>
            <span className="text-xs text-pink-400 font-semibold">
              {series.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-3 drop-shadow-md">
            {series.title}
          </h1>

          {/* Genres */}
          <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm font-medium text-neutral-300">
            {series.genres?.map((g, idx) => (
              <span key={g} className="flex items-center">
                <span className="text-neutral-200">{g}</span>
                {idx < series.genres.length - 1 && (
                  <span className="mx-2 text-neutral-500">•</span>
                )}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-neutral-300 text-sm sm:text-base line-clamp-3 mb-6 max-w-xl leading-relaxed text-balance font-normal drop-shadow">
            {series.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {firstEpisode ? (
              <button
                onClick={() => onWatchEpisode(firstEpisode, series)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-bold text-sm sm:text-base hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-pink-600/30 group"
                id="hero-watch-now-btn"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <span>Watch Episode 1</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenSeries(series)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-sm sm:text-base"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>View Details</span>
              </button>
            )}

            <button
              onClick={() => onToggleBookmark(series.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold backdrop-blur-md border transition-all ${
                isBookmarked
                  ? 'bg-pink-600/20 text-pink-400 border-pink-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              id="hero-bookmark-btn"
            >
              {isBookmarked ? (
                <>
                  <Check className="w-4 h-4 text-pink-400" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-neutral-300" />
                  <span>Add to List</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenSeries(series)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-white/10 text-sm font-semibold transition-colors"
              id="hero-more-info-btn"
            >
              <Info className="w-4 h-4 text-neutral-400" />
              <span>Episodes</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

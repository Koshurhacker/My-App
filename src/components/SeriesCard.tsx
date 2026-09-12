import React from 'react';
import { Play, Plus, Check, Star, Sparkles } from 'lucide-react';
import { Series } from '../types';

interface SeriesCardProps {
  series: Series;
  onOpen: (series: Series) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (seriesId: string) => void;
  aspect?: 'portrait' | 'landscape';
}

export const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  onOpen,
  isBookmarked = false,
  onToggleBookmark,
  aspect = 'portrait',
}) => {
  return (
    <div
      onClick={() => onOpen(series)}
      className="group relative flex flex-col cursor-pointer transition-all duration-300 select-none"
      id={`series-card-${series.id}`}
    >
      {/* Poster Image Container */}
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-neutral-900 border border-white/5 shadow-md group-hover:shadow-pink-500/10 group-hover:border-pink-500/30 transition-all ${
          aspect === 'portrait' ? 'aspect-[2/3]' : 'aspect-[16/9]'
        }`}
      >
        <img
          src={aspect === 'portrait' ? series.posterUrl : (series.bannerUrl || series.posterUrl)}
          alt={series.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {series.isTrending && (
            <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
              🔥 Trending
            </span>
          )}
          {series.isNewRelease && !series.isTrending && (
            <span className="px-2 py-0.5 rounded bg-pink-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
              New
            </span>
          )}
          {series.status === 'Coming Soon' && (
            <span className="px-2 py-0.5 rounded bg-neutral-800/90 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
              Coming Soon
            </span>
          )}
        </div>

        {/* Bookmark Quick Action Button */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(series.id);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100 transition-all z-10"
            title={isBookmarked ? 'Remove from List' : 'Add to List'}
          >
            {isBookmarked ? (
              <Check className="w-3.5 h-3.5 text-pink-400" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Play Icon Badge Center on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/40 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Metadata in Image */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[11px] text-neutral-300 z-10">
          <span className="font-semibold text-white/90 truncate max-w-[120px]">
            {series.language}
          </span>
          <span className="bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-neutral-300 font-medium">
            {series.totalEpisodes || series.episodes?.length || 5} eps
          </span>
        </div>
      </div>

      {/* Title & Genre Labels below */}
      <div className="mt-2.5">
        <h3 className="font-bold text-sm text-neutral-100 group-hover:text-pink-400 transition-colors line-clamp-1">
          {series.title}
        </h3>
        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
          {series.genres?.join(' • ')}
        </p>
      </div>
    </div>
  );
};

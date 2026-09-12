import React from 'react';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { Episode, Series } from '../types';

interface EpisodeCardProps {
  episode: Episode;
  series?: Series;
  onPlay: (episode: Episode, series?: Series) => void;
  progressPercentage?: number;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  series,
  onPlay,
  progressPercentage,
}) => {
  return (
    <div
      onClick={() => onPlay(episode, series)}
      className="group flex flex-col bg-neutral-900/60 hover:bg-neutral-900/90 rounded-xl overflow-hidden border border-white/5 hover:border-pink-500/30 transition-all duration-200 cursor-pointer select-none"
      id={`episode-card-${episode.id}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
        <img
          src={episode.thumbnailUrl}
          alt={episode.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition-colors">
          <div className="w-10 h-10 rounded-full bg-pink-600/90 group-hover:bg-pink-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-neutral-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span>{episode.durationFormatted}</span>
        </div>

        {/* Episode Number badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-pink-400 border border-pink-500/20">
          EP {episode.episodeNumber}
        </div>

        {/* Watch Progress bar */}
        {typeof progressPercentage === 'number' && progressPercentage > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div
              className="h-full bg-pink-500 transition-all duration-300"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
        )}
      </div>

      {/* Episode Info */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          {series && (
            <span className="text-[11px] font-medium text-pink-400 line-clamp-1">
              {series.title}
            </span>
          )}
          <h4 className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors line-clamp-1 mt-0.5">
            {episode.title}
          </h4>
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {episode.description}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3 text-neutral-500" />
            <span>{episode.viewsCount.toLocaleString()} views</span>
          </span>
          <span className="text-pink-400 font-semibold group-hover:underline">
            Watch Now →
          </span>
        </div>
      </div>
    </div>
  );
};

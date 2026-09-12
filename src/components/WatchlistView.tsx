import React from 'react';
import { Bookmark, Film, Play, ArrowLeft } from 'lucide-react';
import { Series, Episode } from '../types';
import { SeriesCard } from './SeriesCard';

interface WatchlistViewProps {
  bookmarkedSeries: Series[];
  onOpenSeries: (series: Series) => void;
  onBackToBrowse: () => void;
  onRemoveBookmark: (seriesId: string) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  bookmarkedSeries,
  onOpenSeries,
  onBackToBrowse,
  onRemoveBookmark,
}) => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBackToBrowse}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-pink-500 fill-current" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Your saved micro dramas to watch anytime.
          </p>
        </div>

        <span className="text-xs text-neutral-400 bg-neutral-900 border border-white/10 px-3 py-1.5 rounded-xl font-semibold">
          {bookmarkedSeries.length} titles
        </span>
      </div>

      {bookmarkedSeries.length === 0 ? (
        <div className="text-center py-20 bg-neutral-900/30 rounded-3xl border border-white/5 max-w-lg mx-auto">
          <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Your watchlist is empty</h3>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-6">
            Tap the "+ Add to List" button on any micro drama series to save it here for later.
          </p>
          <button
            onClick={onBackToBrowse}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-pink-600/20"
          >
            Explore Dramas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {bookmarkedSeries.map((series) => (
            <div key={series.id} className="relative group">
              <SeriesCard series={series} onOpen={onOpenSeries} aspect="portrait" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(series.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                title="Remove from list"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

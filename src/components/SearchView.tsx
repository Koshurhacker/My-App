import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Film, Play, Sparkles, Filter, X } from 'lucide-react';
import { Series, Episode, Genre } from '../types';
import { api } from '../services/api';
import { SeriesCard } from './SeriesCard';
import { EpisodeCard } from './EpisodeCard';

interface SearchViewProps {
  onOpenSeries: (series: Series) => void;
  onPlayEpisode: (episode: Episode, series?: Series) => void;
  genres: Genre[];
}

export const SearchView: React.FC<SearchViewProps> = ({ onOpenSeries, onPlayEpisode, genres }) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [results, setResults] = useState<{ series: Series[]; episodes: Episode[] }>({
    series: [],
    episodes: [],
  });
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of published series for browse discovery
    api.getSeries().then((data) => setAllSeries(data));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const res = await api.search(query.trim());
          setResults(res);
        } catch (err) {
          console.error('Search error', err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ series: [], episodes: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Filtered series by genre when query is empty or combined
  const filteredSeries = selectedGenre === 'All'
    ? allSeries
    : allSeries.filter((s) => s.genres.includes(selectedGenre));

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pt-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Search Header Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-2">
          Discover Micro Dramas
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 text-center mb-6">
          Search by series title, episode name, genre, director, or actor
        </p>

        {/* Input Field */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. The Last Promise, Kabir, Romance, Thriller..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-neutral-900/90 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-sm shadow-xl transition-all"
            id="search-input-field"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Genre Pill Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedGenre('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === 'All'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g.name
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {query.trim().length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-200">
              Search Results for <span className="text-pink-400">"{query}"</span>
            </h2>
            <span className="text-xs text-neutral-400">
              {results.series.length} series • {results.episodes.length} episodes
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-neutral-400">
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching library...
            </div>
          ) : results.series.length === 0 && results.episodes.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-white/5">
              <Film className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No matching micro-dramas found</p>
              <p className="text-xs text-neutral-500 mt-1">Try another keyword or browse genres below.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Matched Series */}
              {results.series.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    Matching Series ({results.series.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.series.map((s) => (
                      <SeriesCard key={s.id} series={s} onOpen={onOpenSeries} aspect="portrait" />
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Episodes */}
              {results.episodes.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    Matching Episodes ({results.episodes.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.episodes.map((ep) => {
                      const parentSeries = allSeries.find((s) => s.id === ep.seriesId);
                      return (
                        <EpisodeCard
                          key={ep.id}
                          episode={ep}
                          series={parentSeries}
                          onPlay={(e, s) => onPlayEpisode(e, s || parentSeries)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Default Explore View by Genre */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              {selectedGenre === 'All' ? 'All Micro Dramas' : `${selectedGenre} Series`}
            </h2>
            <span className="text-xs text-neutral-400">{filteredSeries.length} titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredSeries.map((s) => (
              <SeriesCard key={s.id} series={s} onOpen={onOpenSeries} aspect="portrait" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

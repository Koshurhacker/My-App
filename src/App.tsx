import React, { useState, useEffect } from 'react';
import {
  Film,
  Play,
  Flame,
  Clock,
  Sparkles,
  Heart,
  TrendingUp,
  Tv,
  Bookmark,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Series, Episode, Genre, User, WatchProgress } from './types';
import { api } from './services/api';

// Components
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { HeroBanner } from './components/HeroBanner';
import { ContentRow } from './components/ContentRow';
import { SeriesCard } from './components/SeriesCard';
import { EpisodeCard } from './components/EpisodeCard';
import { SeriesDetailView } from './components/SeriesDetailView';
import { SearchView } from './components/SearchView';
import { WatchlistView } from './components/WatchlistView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ShareModal } from './components/ShareModal';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ViewerAuthModal } from './components/ViewerAuthModal';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'series' | 'search' | 'micro-dramas' | 'bookmarks' | 'admin' | 'profile'>('home');
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState<string | null>(null);

  // App Data
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  // User & Admin Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Bookmarks / Watchlist
  const [bookmarkedSeriesIds, setBookmarkedSeriesIds] = useState<string[]>([]);

  // Continue Watching
  const [continueWatchingItems, setContinueWatchingItems] = useState<{
    progress: WatchProgress;
    episode: Episode;
    series: Series;
  }[]>([]);

  // Video Player Modal State
  const [activePlayerEpisode, setActivePlayerEpisode] = useState<Episode | null>(null);
  const [activePlayerSeries, setActivePlayerSeries] = useState<Series | null>(null);
  const [playerInitialProgress, setPlayerInitialProgress] = useState<number>(0);
  const [likedEpisodeIds, setLikedEpisodeIds] = useState<string[]>([]);

  // Modals
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isViewerAuthOpen, setIsViewerAuthOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ series: Series; episode?: Episode } | null>(null);

  // Check saved admin token and viewer profile on initial mount
  useEffect(() => {
    const savedToken = localStorage.getItem('vudoindia_admin_token');
    if (savedToken) {
      setIsAdmin(true);
    }

    const savedUser = localStorage.getItem('vudoindia_viewer_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [seriesData, genresData] = await Promise.all([
        api.getSeries(),
        api.getGenres(),
      ]);
      setAllSeries(seriesData);
      setGenres(genresData);

      // Load user bookmarks & continue watching
      const bookmarks = await api.getBookmarks();
      setBookmarkedSeriesIds(bookmarks);

      const history = await api.getContinueWatching();
      setContinueWatchingItems(history);
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL hash changes for direct linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/series/')) {
        const slug = hash.replace('/series/', '');
        setSelectedSeriesSlug(slug);
        setCurrentView('series');
      } else if (hash === '/admin') {
        setCurrentView('admin');
      } else if (hash === '/search') {
        setCurrentView('search');
      } else if (hash === '/bookmarks' || hash === '/watchlist') {
        setCurrentView('bookmarks');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation router
  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'series' && param) {
      setSelectedSeriesSlug(param);
      setCurrentView('series');
      window.location.hash = `/series/${param}`;
    } else if (view === 'admin') {
      if (isAdmin) {
        setCurrentView('admin');
        window.location.hash = '/admin';
      } else {
        setIsAdminLoginOpen(true);
      }
    } else if (view === 'micro-dramas') {
      setCurrentView('search');
      window.location.hash = '/search';
    } else if (view === 'bookmarks') {
      setCurrentView('bookmarks');
      window.location.hash = '/bookmarks';
    } else if (view === 'profile') {
      if (currentUser) {
        setCurrentView('bookmarks');
      } else {
        setIsViewerAuthOpen(true);
      }
    } else {
      setCurrentView('home');
      setSelectedSeriesSlug(null);
      window.location.hash = '';
    }
  };

  // Open Series detail view
  const handleOpenSeries = (series: Series) => {
    setSelectedSeriesSlug(series.id);
    setCurrentView('series');
    window.location.hash = `/series/${series.id}`;
  };

  // Open Video Player
  const handlePlayEpisode = (episode: Episode, series?: Series) => {
    const parentSeries = series || allSeries.find((s) => s.id === episode.seriesId) || null;
    setActivePlayerEpisode(episode);
    setActivePlayerSeries(parentSeries);

    // Check if there is existing watch progress
    const matchedProgress = continueWatchingItems.find((cw) => cw.episode.id === episode.id);
    setPlayerInitialProgress(matchedProgress?.progress.currentTimeSeconds || 0);
  };

  // Bookmarking handler
  const handleToggleBookmark = async (seriesId: string) => {
    try {
      const res = await api.toggleBookmark(seriesId);
      if (res.bookmarked) {
        setBookmarkedSeriesIds((prev) => [...prev, seriesId]);
      } else {
        setBookmarkedSeriesIds((prev) => prev.filter((id) => id !== seriesId));
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    }
  };

  // Like episode handler
  const handleToggleLike = async (episodeId: string) => {
    try {
      const res = await api.toggleLikeEpisode(episodeId);
      if (res.liked) {
        setLikedEpisodeIds((prev) => [...prev, episodeId]);
      } else {
        setLikedEpisodeIds((prev) => prev.filter((id) => id !== episodeId));
      }
    } catch (e) {
      console.error('Failed to toggle like', e);
    }
  };

  // Progress saver
  const handleSaveProgress = async (
    episodeId: string,
    seriesId: string,
    currentTime: number,
    duration: number
  ) => {
    try {
      await api.saveWatchProgress(episodeId, seriesId, currentTime, duration);
      // Refresh continue watching silently
      api.getContinueWatching().then((data) => setContinueWatchingItems(data));
    } catch (e) {
      console.error(e);
    }
  };

  // View counter
  const handleRecordView = async (episodeId: string, seriesId: string, durationSeconds: number) => {
    try {
      await api.recordView(episodeId, seriesId, durationSeconds);
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Login success
  const handleAdminLoginSuccess = (token: string) => {
    setIsAdmin(true);
    setCurrentView('admin');
    window.location.hash = '/admin';
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('vudoindia_admin_token');
    setIsAdmin(false);
    setCurrentView('home');
    window.location.hash = '';
  };

  // Viewer Login success
  const handleViewerLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('vudoindia_viewer_user', JSON.stringify(user));
  };

  // Computed data
  const heroSeries = allSeries.find((s) => s.isFeatured) || allSeries[0] || null;
  const trendingSeries = allSeries.filter((s) => s.isTrending).sort((a, b) => (a.homepageOrder || 1) - (b.homepageOrder || 1));
  const newReleases = allSeries.filter((s) => s.isNewRelease);
  const romanceSeries = allSeries.filter((s) => s.genres.includes('Romance'));
  const thrillerSeries = allSeries.filter((s) => s.genres.includes('Thriller') || s.genres.includes('Mystery'));

  // Collect all published episodes across all series for the "Latest Released Episodes" row
  const allPublishedEpisodes: { episode: Episode; series: Series }[] = [];
  allSeries.forEach((ser) => {
    (ser.episodes || []).forEach((ep) => {
      if (ep.status === 'Published') {
        allPublishedEpisodes.push({ episode: ep, series: ser });
      }
    });
  });

  // Selected series for detail view
  const currentDetailSeries = allSeries.find(
    (s) => s.id === selectedSeriesSlug || s.title.toLowerCase().replace(/\s+/g, '-') === selectedSeriesSlug
  ) || allSeries[0];

  // Bookmarked series objects
  const bookmarkedSeriesList = allSeries.filter((s) => bookmarkedSeriesIds.includes(s.id));

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white">
      {/* Header (Hidden when inside full Admin Studio for max screen workspace) */}
      {currentView !== 'admin' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onOpenViewerLogin={() => setIsViewerAuthOpen(true)}
          onLogoutAdmin={handleAdminLogout}
          onLogoutViewer={() => {
            setCurrentUser(null);
            localStorage.removeItem('vudoindia_viewer_user');
          }}
          bookmarkCount={bookmarkedSeriesIds.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm font-semibold text-neutral-400">Loading vudoindia Micro Dramas...</span>
          </div>
        ) : (
          <>
            {/* VIEW 1: HOME PAGE */}
            {currentView === 'home' && (
              <div>
                {/* Hero Spotlight Banner */}
                <HeroBanner
                  series={heroSeries}
                  onWatchEpisode={handlePlayEpisode}
                  onOpenSeries={handleOpenSeries}
                  isBookmarked={heroSeries ? bookmarkedSeriesIds.includes(heroSeries.id) : false}
                  onToggleBookmark={handleToggleBookmark}
                />

                {/* Continue Watching Row (Only if user has watch history) */}
                {continueWatchingItems.length > 0 && (
                  <ContentRow
                    title="Continue Watching"
                    subtitle="Pick up right where you left off"
                    icon={<Clock className="w-5 h-5 text-amber-400" />}
                  >
                    {continueWatchingItems.map((item) => {
                      const percent = Math.min(
                        100,
                        Math.round((item.progress.currentTimeSeconds / (item.progress.durationSeconds || 1)) * 100)
                      );
                      return (
                        <div
                          key={item.episode.id}
                          onClick={() => handlePlayEpisode(item.episode, item.series)}
                          className="flex-shrink-0 w-64 sm:w-72 bg-neutral-900/90 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer hover:border-pink-500/40 transition-all shadow-lg"
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={item.episode.thumbnailUrl}
                              alt={item.episode.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-neutral-800">
                              <div
                                className="h-full bg-gradient-to-r from-pink-500 to-amber-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                          <div className="p-3">
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                              {item.series.title}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                              Ep {item.episode.episodeNumber}: {item.episode.title}
                            </h4>
                            <span className="text-[10px] text-neutral-400 block mt-1">
                              {Math.floor(item.progress.currentTimeSeconds / 60)}m left
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </ContentRow>
                )}

                {/* Trending Micro Dramas Carousel */}
                <ContentRow
                  title="Trending Micro Dramas"
                  subtitle="Top watched short-form episodic stories in India"
                  icon={<Flame className="w-5 h-5 text-rose-500" />}
                  onSeeAll={() => handleNavigate('search')}
                >
                  {(trendingSeries.length > 0 ? trendingSeries : allSeries).map((series, index) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      onOpen={handleOpenSeries}
                      aspect="portrait"
                      rank={index + 1}
                    />
                  ))}
                </ContentRow>

                {/* Latest Released Episodes */}
                <ContentRow
                  title="Latest Episodes"
                  subtitle="Fresh new episodes direct from the creator"
                  icon={<Sparkles className="w-5 h-5 text-pink-400" />}
                >
                  {allPublishedEpisodes.slice(0, 8).map(({ episode, series }) => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                      series={series}
                      onPlay={(ep, ser) => handlePlayEpisode(ep, ser || series)}
                    />
                  ))}
                </ContentRow>

                {/* Romance Dramas */}
                {romanceSeries.length > 0 && (
                  <ContentRow
                    title="Romance & Heartbreaks"
                    subtitle="Passion, secrets, and modern Indian love stories"
                    icon={<Heart className="w-5 h-5 text-pink-500 fill-current" />}
                  >
                    {romanceSeries.map((series) => (
                      <SeriesCard
                        key={series.id}
                        series={series}
                        onOpen={handleOpenSeries}
                        aspect="portrait"
                      />
                    ))}
                  </ContentRow>
                )}

                {/* Thriller & Suspense */}
                {thrillerSeries.length > 0 && (
                  <ContentRow
                    title="Edge-of-the-Seat Thrillers"
                    subtitle="Fast-paced mysteries under 3 minutes per episode"
                    icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
                  >
                    {thrillerSeries.map((series) => (
                      <SeriesCard
                        key={series.id}
                        series={series}
                        onOpen={handleOpenSeries}
                        aspect="portrait"
                      />
                    ))}
                  </ContentRow>
                )}

                {/* All Series in Catalog */}
                <ContentRow
                  title="All Original Micro Dramas"
                  subtitle="Explore the complete vudoindia original catalog"
                  icon={<Tv className="w-5 h-5 text-purple-400" />}
                >
                  {allSeries.map((series) => (
                    <SeriesCard
                      key={series.id}
                      series={series}
                      onOpen={handleOpenSeries}
                      aspect="landscape"
                    />
                  ))}
                </ContentRow>
              </div>
            )}

            {/* VIEW 2: SERIES DETAIL PAGE */}
            {currentView === 'series' && currentDetailSeries && (
              <SeriesDetailView
                series={currentDetailSeries}
                onBack={() => handleNavigate('home')}
                onPlayEpisode={(ep, ser) => handlePlayEpisode(ep, ser)}
                isBookmarked={bookmarkedSeriesIds.includes(currentDetailSeries.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenShare={(ser, ep) => setShareModalData({ series: ser, episode: ep })}
              />
            )}

            {/* VIEW 3: SEARCH & DISCOVERY PAGE */}
            {(currentView === 'search' || currentView === 'micro-dramas') && (
              <SearchView
                genres={genres}
                onOpenSeries={handleOpenSeries}
                onPlayEpisode={(ep, ser) => handlePlayEpisode(ep, ser)}
              />
            )}

            {/* VIEW 4: MY WATCHLIST */}
            {currentView === 'bookmarks' && (
              <WatchlistView
                bookmarkedSeries={bookmarkedSeriesList}
                onOpenSeries={handleOpenSeries}
                onBackToBrowse={() => handleNavigate('home')}
                onRemoveBookmark={handleToggleBookmark}
              />
            )}

            {/* VIEW 5: ADMIN DASHBOARD */}
            {currentView === 'admin' && isAdmin && (
              <AdminDashboard
                onBackToPublic={() => handleNavigate('home')}
                onLogout={handleAdminLogout}
                onPreviewEpisode={(ep, ser) => handlePlayEpisode(ep, ser)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (Hidden in Admin Dashboard) */}
      {currentView !== 'admin' && (
        <footer className="bg-[#0c0d10] border-t border-white/5 py-12 pb-24 md:pb-12 text-neutral-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 flex items-center justify-center">
                  <Film className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">vudoindia — Micro Dramas</span>
                  <p className="text-[11px] text-neutral-500">
                    A premier creator-owned micro-drama streaming platform.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <button onClick={() => handleNavigate('home')} className="hover:text-white transition-colors">
                  Home
                </button>
                <button onClick={() => handleNavigate('search')} className="hover:text-white transition-colors">
                  Explore Dramas
                </button>
                <button onClick={() => handleNavigate('bookmarks')} className="hover:text-white transition-colors">
                  Watchlist
                </button>
                <button
                  onClick={() => {
                    if (isAdmin) handleNavigate('admin');
                    else setIsAdminLoginOpen(true);
                  }}
                  className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Creator Studio</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500">
              <p>© {new Date().getFullYear()} vudoindia. All rights reserved. Sole content creator platform.</p>
              <p>Crafted for ultra-fast, bite-sized vertical and landscape mobile streaming.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Bottom Navigation for Mobile Devices */}
      {currentView !== 'admin' && (
        <MobileNav
          currentView={currentView}
          onNavigate={handleNavigate}
          isAdmin={isAdmin}
        />
      )}

      {/* Video Player Modal */}
      {activePlayerEpisode && activePlayerSeries && (
        <VideoPlayerModal
          isOpen={!!activePlayerEpisode}
          onClose={() => setActivePlayerEpisode(null)}
          episode={activePlayerEpisode}
          series={activePlayerSeries}
          allEpisodes={activePlayerSeries.episodes || []}
          onSelectEpisode={(ep) => setActivePlayerEpisode(ep)}
          currentUser={currentUser}
          initialProgressSeconds={playerInitialProgress}
          onSaveProgress={handleSaveProgress}
          onRecordView={handleRecordView}
          isLiked={likedEpisodeIds.includes(activePlayerEpisode.id)}
          onToggleLike={handleToggleLike}
          onOpenShare={(ser, ep) => setShareModalData({ series: ser, episode: ep })}
        />
      )}

      {/* Social Share Modal */}
      {shareModalData && (
        <ShareModal
          isOpen={!!shareModalData}
          onClose={() => setShareModalData(null)}
          series={shareModalData.series}
          episode={shareModalData.episode}
        />
      )}

      {/* Creator / Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Viewer Auth Profile Modal */}
      <ViewerAuthModal
        isOpen={isViewerAuthOpen}
        onClose={() => setIsViewerAuthOpen(false)}
        onLoginSuccess={handleViewerLoginSuccess}
      />
    </div>
  );
}

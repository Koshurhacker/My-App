import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Heart,
  MessageSquare,
  Share2,
  X,
  RotateCcw,
  Sparkles,
  PictureInPicture,
  ChevronRight,
} from 'lucide-react';
import { Episode, Series, User } from '../types';
import { CommentsSection } from './CommentsSection';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode;
  series: Series;
  allEpisodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  currentUser: User | null;
  initialProgressSeconds?: number;
  onSaveProgress: (episodeId: string, seriesId: string, currentTime: number, duration: number) => void;
  onRecordView: (episodeId: string, seriesId: string, durationSeconds: number) => void;
  isLiked: boolean;
  onToggleLike: (episodeId: string) => void;
  onOpenShare: (series: Series, episode: Episode) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  episode,
  series,
  allEpisodes,
  onSelectEpisode,
  currentUser,
  initialProgressSeconds = 0,
  onSaveProgress,
  onRecordView,
  isLiked,
  onToggleLike,
  onOpenShare,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode.duration || 180);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showComments, setShowComments] = useState(false);

  // Auto next episode countdown
  const [isEnded, setIsEnded] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Determine prev and next episodes within current series
  const sortedEpisodes = [...allEpisodes].sort((a, b) => a.orderIndex - b.orderIndex);
  const currentIndex = sortedEpisodes.findIndex((e) => e.id === episode.id);
  const prevEpisode = currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex >= 0 && currentIndex < sortedEpisodes.length - 1 ? sortedEpisodes[currentIndex + 1] : null;

  // View recording triggered once per episode session
  const viewLoggedRef = useRef(false);

  // Set initial time when episode opens
  useEffect(() => {
    setIsEnded(false);
    setCountdown(5);
    viewLoggedRef.current = false;

    if (videoRef.current) {
      videoRef.current.currentTime = initialProgressSeconds > 5 ? initialProgressSeconds : 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [episode.id, initialProgressSeconds]);

  // Handle countdown when ended
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEnded && nextEpisode) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else if (countdown === 0) {
        onSelectEpisode(nextEpisode);
      }
    }
    return () => clearTimeout(timer);
  }, [isEnded, countdown, nextEpisode, onSelectEpisode]);

  // Periodic watch progress saver & view logger
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused && videoRef.current.duration > 0) {
        const cur = Math.floor(videoRef.current.currentTime);
        const dur = Math.floor(videoRef.current.duration);
        onSaveProgress(episode.id, series.id, cur, dur);

        // Record view if watched at least 10 seconds
        if (cur >= 10 && !viewLoggedRef.current) {
          viewLoggedRef.current = true;
          onRecordView(episode.id, series.id, cur);
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [episode.id, series.id, onSaveProgress, onRecordView]);

  // Controls auto-hide
  const triggerUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    triggerUserActivity();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || episode.duration || 180);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
    triggerUserActivity();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettingsMenu(false);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row items-stretch justify-center select-none animate-in fade-in duration-200"
      onMouseMove={triggerUserActivity}
      onTouchStart={triggerUserActivity}
      id="video-player-modal-root"
    >
      {/* Main Video Area */}
      <div
        ref={containerRef}
        className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden h-full ${
          showComments ? 'md:w-2/3 lg:w-3/4' : 'w-full'
        }`}
      >
        <video
          ref={videoRef}
          src={episode.videoUrl}
          poster={episode.thumbnailUrl}
          playsInline
          className="w-full h-full object-contain max-h-screen cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsEnded(true);
            setIsPlaying(false);
          }}
        />

        {/* Top Floating Bar */}
        <div
          className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
              title="Close Player"
              id="player-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs text-pink-400 font-semibold uppercase tracking-wider line-clamp-1">
                {series.title}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                EP {episode.episodeNumber}: {episode.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLike(episode.id)}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isLiked
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/40'
                  : 'bg-black/60 hover:bg-black/80 text-white'
              }`}
              title={isLiked ? 'Liked' : 'Like'}
              id="player-like-btn"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onOpenShare(series, episode)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
              title="Share Episode"
              id="player-share-btn"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                showComments ? 'bg-pink-600 text-white' : 'bg-black/60 hover:bg-black/80 text-white'
              }`}
              title="Comments"
              id="player-toggle-comments-btn"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Overlay: Finished Episode Countdown Card */}
        {isEnded && nextEpisode && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Up Next in {countdown}s
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">
                Episode {nextEpisode.episodeNumber} — {nextEpisode.title}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2 mb-6">
                {nextEpisode.description}
              </p>

              {/* Progress bar countdown */}
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-amber-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsEnded(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Stay on this episode
                </button>
                <button
                  onClick={() => onSelectEpisode(nextEpisode)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-pink-600/30"
                  id="player-play-next-now-btn"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Next Now</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Video Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Bar */}
          <div className="relative group/seek mb-3">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:h-2 transition-all"
            />
            {/* Played fill */}
            <div
              className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-pink-600 to-rose-500 rounded-lg pointer-events-none group-hover/seek:h-2 transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls: Play, Prev, Next, Volume, Time */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                id="player-play-pause-btn"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Prev / Next Episode Buttons */}
              <button
                onClick={() => prevEpisode && onSelectEpisode(prevEpisode)}
                disabled={!prevEpisode}
                className="p-2 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Episode"
                id="player-prev-ep-btn"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => nextEpisode && onSelectEpisode(nextEpisode)}
                disabled={!nextEpisode}
                className="p-2 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Episode"
                id="player-next-ep-btn"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-neutral-300 hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Time display */}
              <span className="text-xs text-neutral-300 font-medium">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
            </div>

            {/* Right Controls: Quality, Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-2 relative">
              {/* Speed & Quality Settings Menu Button */}
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors ${
                  showSettingsMenu ? 'text-pink-400 bg-white/10' : ''
                }`}
                title="Playback Settings"
                id="player-settings-btn"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown popover */}
              {showSettingsMenu && (
                <div className="absolute bottom-12 right-0 w-48 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl z-30 text-xs">
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Playback Speed
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => changePlaybackSpeed(spd)}
                          className={`px-2 py-1 rounded text-center font-medium transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-pink-600 text-white font-bold'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Resolution Quality
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {['Auto', '1080p', '720p', '480p'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowSettingsMenu(false);
                          }}
                          className={`px-2 py-1 rounded text-center font-medium transition-colors ${
                            quality === q
                              ? 'bg-pink-600 text-white font-bold'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="hidden sm:block p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Picture in Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Fullscreen"
                id="player-fullscreen-btn"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer: Comments & Next Episodes */}
      {showComments && (
        <div className="w-full md:w-1/3 lg:w-1/4 h-[40vh] md:h-full bg-[#121318] border-t md:border-t-0 md:border-l border-white/10 flex flex-col z-30">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Episode Comments</h4>
            <button
              onClick={() => setShowComments(false)}
              className="p-1 text-neutral-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CommentsSection episodeId={episode.id} currentUser={currentUser} />
          </div>
        </div>
      )}
    </div>
  );
};

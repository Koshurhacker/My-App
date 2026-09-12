import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Tv,
  Film,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  Image,
  Video,
  Play,
  Check,
} from 'lucide-react';
import { Series, Season, Episode } from '../../types';
import { api } from '../../services/api';

interface AdminUploadWizardProps {
  existingSeries: Series[];
  onComplete: () => void;
}

const PRESET_VIDEOS = [
  { name: 'Romance / Rain Palace (High Quality)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { name: 'Monsoon Mumbai Thriller (Fast Action)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { name: 'Tamil Beats / Chennai Street Rap', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
  { name: 'Emotional Climax Drama', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4' },
];

const PRESET_THUMBNAILS = [
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
];

export const AdminUploadWizard: React.FC<AdminUploadWizardProps> = ({ existingSeries, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Series Selection or Creation
  const [seriesMode, setSeriesMode] = useState<'existing' | 'new'>(existingSeries.length > 0 ? 'existing' : 'new');
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(existingSeries[0]?.id || '');
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');
  const [newSeriesGenre, setNewSeriesGenre] = useState('Romance');
  const [newSeriesLanguage, setNewSeriesLanguage] = useState('Hindi');
  const [newSeriesPoster, setNewSeriesPoster] = useState(PRESET_THUMBNAILS[0]);
  const [newSeriesDirector, setNewSeriesDirector] = useState('Anand L. Rai');

  // Season
  const [seasonTitle, setSeasonTitle] = useState('Season 1');

  // Episode Details
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState(PRESET_VIDEOS[0].url);
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_THUMBNAILS[0]);
  const [duration, setDuration] = useState(180);
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>('Published');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handlePublishAll = async () => {
    setLoading(true);
    setSuccessMessage('');

    try {
      let targetSeriesId = selectedSeriesId;

      // 1. Create Series if new mode
      if (seriesMode === 'new') {
        const createdSeries = await api.createSeries({
          title: newSeriesTitle || 'New Micro Drama Series',
          description: newSeriesDescription,
          genres: [newSeriesGenre, 'Drama'],
          language: newSeriesLanguage,
          director: newSeriesDirector,
          posterUrl: newSeriesPoster,
          bannerUrl: newSeriesPoster,
          status: 'Ongoing',
          isNewRelease: true,
          isTrending: true,
        });
        targetSeriesId = createdSeries.id;
      }

      // 2. Fetch or create season
      const seriesObj = await api.getSeriesBySlug(targetSeriesId);
      let targetSeasonId = seriesObj.seasons?.[0]?.id;
      if (!targetSeasonId) {
        const createdSeason = await api.createSeason(targetSeriesId, seasonTitle);
        targetSeasonId = createdSeason.id;
      }

      // 3. Create and publish episode
      const min = Math.floor(duration / 60);
      const sec = duration % 60;
      await api.createEpisode({
        seriesId: targetSeriesId,
        seasonId: targetSeasonId,
        title: episodeTitle || `Episode ${episodeNumber}`,
        episodeNumber,
        description: episodeDescription,
        videoUrl,
        thumbnailUrl,
        duration,
        durationFormatted: `${min}m ${sec.toString().padStart(2, '0')}s`,
        releaseDate,
        status,
        isFeatured: true,
      });

      setSuccessMessage('🎉 Episode successfully published to vudoindia public website!');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Wizard publishing failed', err);
      alert('Failed to publish episode. Check fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121318] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
      {/* Wizard Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-800 -translate-y-1/2 z-0" />
          
          {[
            { stepNum: 1, label: 'Series', icon: Tv },
            { stepNum: 2, label: 'Season', icon: Layers },
            { stepNum: 3, label: 'Media & Video', icon: Video },
            { stepNum: 4, label: 'Publish', icon: CheckCircle2 },
          ].map((item) => {
            const isDone = step > item.stepNum;
            const isCurrent = step === item.stepNum;
            const Icon = item.icon;
            return (
              <div key={item.stepNum} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-pink-600 text-white'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-pink-600 to-amber-500 text-white ring-4 ring-pink-500/20 shadow-lg'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 ${isCurrent ? 'text-pink-400' : 'text-neutral-400'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {successMessage ? (
        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{successMessage}</h3>
          <p className="text-xs text-neutral-400">Redirecting to updated catalog...</p>
        </div>
      ) : (
        <div>
          {/* STEP 1: SERIES */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 1: Choose or Create Series</h3>
                <p className="text-xs text-neutral-400">Select which micro drama this episode belongs to.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeriesMode('existing')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    seriesMode === 'existing'
                      ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  Choose Existing Series
                </button>
                <button
                  type="button"
                  onClick={() => setSeriesMode('new')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    seriesMode === 'new'
                      ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  + Create Brand New Series
                </button>
              </div>

              {seriesMode === 'existing' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">Select Series</label>
                  <select
                    value={selectedSeriesId}
                    onChange={(e) => setSelectedSeriesId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    {existingSeries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.language} • {s.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Series Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Whispers of Jaipur"
                        value={newSeriesTitle}
                        onChange={(e) => setNewSeriesTitle(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Primary Genre</label>
                      <select
                        value={newSeriesGenre}
                        onChange={(e) => setNewSeriesGenre(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        {['Romance', 'Drama', 'Thriller', 'Short Films', 'Mystery', 'Action'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Language</label>
                      <input
                        type="text"
                        placeholder="e.g. Hindi, Tamil, Telugu"
                        value={newSeriesLanguage}
                        onChange={(e) => setNewSeriesLanguage(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Director</label>
                      <input
                        type="text"
                        placeholder="Director Name"
                        value={newSeriesDirector}
                        onChange={(e) => setNewSeriesDirector(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Series Logline / Description</label>
                    <textarea
                      rows={2}
                      placeholder="Short catchy synopsis of the micro drama..."
                      value={newSeriesDescription}
                      onChange={(e) => setNewSeriesDescription(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Poster Image URL</label>
                    <input
                      type="text"
                      value={newSeriesPoster}
                      onChange={(e) => setNewSeriesPoster(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SEASON */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 2: Season</h3>
                <p className="text-xs text-neutral-400">Micro dramas can have unlimited seasons.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Season Title</label>
                <input
                  type="text"
                  value={seasonTitle}
                  onChange={(e) => setSeasonTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-pink-500"
                  placeholder="e.g. Season 1"
                />
              </div>

              <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300">
                💡 Tip: You can add more seasons later in the Seasons Manager at any time.
              </div>
            </div>
          )}

          {/* STEP 3: MEDIA & VIDEO */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 3: Video Stream & Thumbnail</h3>
                <p className="text-xs text-neutral-400">Provide direct video URL or choose from high-speed streaming presets.</p>
              </div>

              {/* Video URL & Presets */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Video URL (Direct MP4 / CDN / HLS)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://your-cdn.com/episode.mp4"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500 mb-2 font-mono"
                />

                {/* Preset selector */}
                <span className="text-[11px] text-neutral-400 block mb-1.5">Or pick demo test clip:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_VIDEOS.map((pv) => (
                    <button
                      key={pv.name}
                      type="button"
                      onClick={() => setVideoUrl(pv.url)}
                      className={`px-3 py-2 rounded-lg text-left text-xs font-medium border transition-colors ${
                        videoUrl === pv.url
                          ? 'bg-pink-600/20 border-pink-500 text-pink-300'
                          : 'bg-neutral-900 border-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {pv.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Episode Thumbnail URL
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500 mb-2"
                />

                {/* Thumbnail Preview */}
                {thumbnailUrl && (
                  <div className="relative aspect-video max-w-xs rounded-xl overflow-hidden border border-white/10 mt-2">
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] text-white">
                      Preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: DETAILS & PUBLISH */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 4: Episode Details & Instant Publish</h3>
                <p className="text-xs text-neutral-400">Finalize title and publish directly to the live vudoindia platform.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Episode Number</label>
                  <input
                    type="number"
                    min="1"
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Episode Title</label>
                  <input
                    type="text"
                    placeholder="e.g. The Awakening"
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Episode summary and cliffhanger..."
                  value={episodeDescription}
                  onChange={(e) => setEpisodeDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 180)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Release Date</label>
                  <input
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="Published">Published (Live Now)</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishAll}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 hover:brightness-110 text-white text-xs font-bold transition-all shadow-lg shadow-pink-600/30 disabled:opacity-50"
                id="wizard-publish-final-btn"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Episode Live</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

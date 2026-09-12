import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2 } from 'lucide-react';
import { Series, Episode } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  series?: Series | null;
  episode?: Episode | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, series, episode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = window.location.origin;
  let sharePath = '';
  let shareTitle = '';
  let shareDescription = '';

  if (series && episode) {
    sharePath = `/series/${series.slug}/season-1/episode-${episode.episodeNumber}`;
    shareTitle = `${series.title} — EP ${episode.episodeNumber}: ${episode.title} | vudoindia`;
    shareDescription = episode.description || series.description;
  } else if (series) {
    sharePath = `/series/${series.slug}`;
    shareTitle = `Watch ${series.title} | vudoindia Micro Dramas`;
    shareDescription = series.description;
  } else {
    sharePath = '/';
    shareTitle = 'vudoindia — Indian Micro Dramas';
    shareDescription = 'Stream binge-worthy original micro-dramas in Hindi, Tamil & more!';
  }

  const shareUrl = `${origin}${sharePath}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Watch "${shareTitle}" on vudoindia: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Binge-watching "${shareTitle}" on vudoindia micro-dramas! 🎬🍿\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareFacebook = () => {
    const u = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#121318] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
        id="share-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Share Micro Drama</h3>
            <p className="text-xs text-neutral-400">Spread the drama with your friends</p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mb-6 p-3 rounded-xl bg-neutral-900/90 border border-white/5 flex gap-3 items-center">
          <img
            src={episode?.thumbnailUrl || series?.posterUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300'}
            alt="Thumbnail"
            className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white line-clamp-1">
              {episode ? `${series?.title} - Ep ${episode.episodeNumber}` : series?.title}
            </h4>
            <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
              {shareDescription}
            </p>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 transition-all font-medium text-xs"
            id="share-whatsapp-btn"
          >
            <MessageCircle className="w-6 h-6 fill-current" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={shareTwitter}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-medium text-xs"
            id="share-x-btn"
          >
            <span className="text-lg font-black font-mono">𝕏</span>
            <span>X (Twitter)</span>
          </button>

          <button
            onClick={shareFacebook}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 transition-all font-medium text-xs"
            id="share-fb-btn"
          >
            <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
              f
            </span>
            <span>Facebook</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            Shareable URL
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-900 border border-white/10">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-neutral-300 px-2 flex-1 focus:outline-none truncate"
            />
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-pink-600 hover:bg-pink-500 text-white'
              }`}
              id="share-copy-link-btn"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

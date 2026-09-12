import React from 'react';
import {
  Film,
  Tv,
  Eye,
  Heart,
  MessageSquare,
  Users,
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { AdminStats } from '../../types';

interface AdminAnalyticsProps {
  stats: AdminStats | null;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading analytics metrics...
      </div>
    );
  }

  const maxViews = Math.max(...stats.dailyViews.map((d) => d.views), 100);

  return (
    <div className="space-y-6">
      {/* 8 Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Total Views</span>
            <Eye className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalViews.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            +18.4% this week
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Total Series</span>
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalSeries}
          </div>
          <span className="text-[11px] text-neutral-400">
            Micro-drama titles
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Total Episodes</span>
            <Tv className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalEpisodes}
          </div>
          <span className="text-[11px] text-neutral-400">
            Published videos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Total Likes</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalLikes.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            Viewer appreciation
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Comments</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalComments.toLocaleString()}
          </div>
          <span className="text-[11px] text-neutral-400">
            Community discussion
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Viewers Registered</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.totalRegisteredViewers}
          </div>
          <span className="text-[11px] text-neutral-400">
            Active viewer profiles
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Avg Completion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.completionRateAverage}%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            High retention
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121318] border border-white/5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Platform Status</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-400">
            Single Creator
          </div>
          <span className="text-[11px] text-neutral-400">
            vudoindia owner
          </span>
        </div>
      </div>

      {/* Highlights: Most Watched Episode & Most Popular Series */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.mostWatchedEpisode && (
          <div className="p-5 rounded-2xl bg-[#121318] border border-white/5 flex gap-4 items-center">
            <img
              src={stats.mostWatchedEpisode.thumbnailUrl}
              alt="Episode"
              className="w-24 aspect-video rounded-xl object-cover bg-neutral-900 border border-white/10 flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                🏆 Most Watched Episode
              </span>
              <h4 className="font-bold text-white text-base truncate mt-0.5">
                {stats.mostWatchedEpisode.title}
              </h4>
              <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                {stats.mostWatchedEpisode.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-neutral-300 font-semibold mt-2">
                <span>{stats.mostWatchedEpisode.viewsCount.toLocaleString()} views</span>
                <span>•</span>
                <span>{stats.mostWatchedEpisode.likesCount} likes</span>
              </div>
            </div>
          </div>
        )}

        {stats.mostPopularSeries && (
          <div className="p-5 rounded-2xl bg-[#121318] border border-white/5 flex gap-4 items-center">
            <img
              src={stats.mostPopularSeries.posterUrl}
              alt="Series"
              className="w-16 h-24 rounded-xl object-cover bg-neutral-900 border border-white/10 flex-shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                ⭐ Most Popular Series
              </span>
              <h4 className="font-bold text-white text-base truncate mt-0.5">
                {stats.mostPopularSeries.title}
              </h4>
              <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                {stats.mostPopularSeries.genres?.join(', ')} • {stats.mostPopularSeries.language}
              </p>
              <div className="flex items-center gap-3 text-xs text-neutral-300 font-semibold mt-2">
                <span>{stats.mostPopularSeries.totalViews?.toLocaleString()} total views</span>
                <span>•</span>
                <span>{stats.mostPopularSeries.totalEpisodes} episodes</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Analytics Chart: 7-Day Organic Viewership Growth */}
      <div className="p-6 rounded-2xl bg-[#121318] border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-white text-base">Viewership Trends (Last 7 Days)</h3>
            <p className="text-xs text-neutral-400">Daily episode plays and streaming engagement</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Metrics</span>
          </div>
        </div>

        {/* Clean Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-2 pt-6">
          {stats.dailyViews.map((d, i) => {
            const heightPercent = Math.max(15, Math.round((d.views / maxViews) * 100));
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.views.toLocaleString()}
                </span>
                <div className="w-full bg-neutral-800 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-pink-600 via-rose-500 to-amber-500 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-125"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-neutral-400 whitespace-nowrap">
                  {d.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Genre Distribution */}
      {stats.genreDistribution && stats.genreDistribution.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#121318] border border-white/5">
          <h3 className="font-bold text-white text-base mb-1">Catalog Genre Performance</h3>
          <p className="text-xs text-neutral-400 mb-4">Breakdown of content volume and audience interest</p>
          
          <div className="space-y-3">
            {stats.genreDistribution.map((gd) => {
              const maxGViews = Math.max(...stats.genreDistribution.map((g) => g.views), 1);
              const barWidth = Math.round((gd.views / maxGViews) * 100);
              return (
                <div key={gd.genre} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-200">{gd.genre}</span>
                    <span className="text-neutral-400">
                      {gd.views.toLocaleString()} views ({gd.count} series)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-amber-500 rounded-full"
                      style={{ width: `${Math.max(5, barWidth)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export interface Genre {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export type SeriesStatus = 'Coming Soon' | 'Ongoing' | 'Completed';
export type EpisodeStatus = 'Draft' | 'Published' | 'Scheduled';

export interface Episode {
  id: string;
  seriesId: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string; // e.g. "3m 45s"
  releaseDate: string; // ISO date string
  status: EpisodeStatus;
  isFeatured?: boolean;
  isTrailer?: boolean;
  orderIndex: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Season {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string; // e.g. "Season 1"
  description?: string;
  orderIndex: number;
  episodesCount?: number;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  posterUrl: string; // Vertical 2:3 poster
  bannerUrl: string; // Horizontal 16:9 banner
  description: string;
  genres: string[]; // e.g. ["Romance", "Drama"]
  language: string; // e.g. "Hindi", "Tamil"
  cast: string[]; // e.g. ["Priya Sharma", "Aarav Kapoor"]
  director: string;
  trailerUrl?: string;
  status: SeriesStatus;
  releaseDate: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewRelease?: boolean;
  homepageOrder?: number;
  totalViews?: number;
  seasons?: Season[];
  episodes?: Episode[];
  totalEpisodes?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  episodeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isHidden?: boolean;
}

export interface WatchProgress {
  userId: string;
  episodeId: string;
  seriesId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatchedAt: string;
  completed: boolean;
  episode?: Episode;
  series?: Series;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'viewer';
  createdAt: string;
}

export interface AdminStats {
  totalVideos: number;
  totalSeries: number;
  totalEpisodes: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalRegisteredViewers: number;
  mostWatchedEpisode: Episode | null;
  mostPopularSeries: Series | null;
  dailyViews: { date: string; views: number }[];
  genreDistribution: { genre: string; count: number; views: number }[];
  completionRateAverage: number;
}

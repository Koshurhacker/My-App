import { Series, Episode, Season, Genre, Comment, WatchProgress, User, AdminStats } from '../types';

const API_BASE = '/api';

function getAdminToken(): string | null {
  return localStorage.getItem('vudoindia_admin_token');
}

function getViewerId(userId?: string): string {
  if (userId) return userId;
  let id = localStorage.getItem('vudoindia_viewer_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('vudoindia_viewer_id', id);
  }
  return id;
}

function authHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async loginAdmin(password: string): Promise<{ success: boolean; token?: string; name?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  async loginViewer(name: string, email?: string): Promise<User> {
    const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@vudoindia.com`;
    // Register / get user
    const res = await fetch(`${API_BASE}/auth/viewer-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: userEmail }),
    });
    const data = await res.json();
    return data.user;
  },

  // Genres
  async getGenres(): Promise<Genre[]> {
    const res = await fetch(`${API_BASE}/genres`);
    return res.json();
  },

  // Series
  async getSeries(all = false): Promise<Series[]> {
    const res = await fetch(`${API_BASE}/series?all=${all}`);
    return res.json();
  },

  async getSeriesBySlug(slug: string): Promise<Series> {
    const res = await fetch(`${API_BASE}/series/${slug}`);
    if (!res.ok) throw new Error('Series not found');
    return res.json();
  },

  async createSeries(data: Partial<Series>): Promise<Series> {
    const res = await fetch(`${API_BASE}/series`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create series');
    return res.json();
  },

  async updateSeries(id: string, data: Partial<Series>): Promise<Series> {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update series');
    return res.json();
  },

  async deleteSeries(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/series/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Seasons
  async createSeason(seriesId: string, title?: string): Promise<Season> {
    const res = await fetch(`${API_BASE}/seasons`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ seriesId, title }),
    });
    return res.json();
  },

  async deleteSeason(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/seasons/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Episodes
  async getEpisodes(all = false): Promise<Episode[]> {
    const res = await fetch(`${API_BASE}/episodes?all=${all}`);
    return res.json();
  },

  async getEpisode(id: string): Promise<{ episode: Episode; prevEpisode: Episode | null; nextEpisode: Episode | null }> {
    const res = await fetch(`${API_BASE}/episodes/${id}`);
    if (!res.ok) throw new Error('Episode not found');
    return res.json();
  },

  async createEpisode(data: Partial<Episode>): Promise<Episode> {
    const res = await fetch(`${API_BASE}/episodes`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create episode');
    return res.json();
  },

  async updateEpisode(id: string, data: Partial<Episode>): Promise<Episode> {
    const res = await fetch(`${API_BASE}/episodes/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update episode');
    return res.json();
  },

  async deleteEpisode(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/episodes/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  async reorderEpisodes(seasonId: string, orderedIds: string[]): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/episodes/reorder`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ seasonId, orderedIds }),
    });
    return res.json();
  },

  // Views & Progress
  async recordView(episodeId: string, seriesId: string, durationSeconds: number): Promise<void> {
    await fetch(`${API_BASE}/views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeId, seriesId, durationSeconds }),
    });
  },

  async saveWatchProgress(
    episodeId: string,
    seriesId: string,
    currentTime: number,
    duration: number,
    userId?: string
  ): Promise<WatchProgress> {
    const uId = getViewerId(userId);
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uId, episodeId, seriesId, currentTime, duration }),
    });
    return res.json();
  },

  async getContinueWatching(userId?: string): Promise<{ progress: WatchProgress; episode: Episode; series: Series }[]> {
    const uId = getViewerId(userId);
    const [progressList, seriesList] = await Promise.all([
      fetch(`${API_BASE}/progress/${uId}`).then((r) => r.json() as Promise<WatchProgress[]>),
      this.getSeries(),
    ]);

    const result: { progress: WatchProgress; episode: Episode; series: Series }[] = [];
    for (const prog of progressList) {
      const parentSeries = seriesList.find((s) => s.id === prog.seriesId);
      if (parentSeries && parentSeries.episodes) {
        const targetEp = parentSeries.episodes.find((e) => e.id === prog.episodeId);
        if (targetEp) {
          result.push({
            progress: prog,
            episode: targetEp,
            series: parentSeries,
          });
        }
      }
    }
    return result;
  },

  // Likes & Bookmarks
  async toggleLikeEpisode(episodeId: string, userId?: string): Promise<{ liked: boolean }> {
    const uId = getViewerId(userId);
    const res = await fetch(`${API_BASE}/likes/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uId, episodeId }),
    });
    return res.json();
  },

  async toggleBookmark(seriesId: string, userId?: string): Promise<{ bookmarked: boolean }> {
    const uId = getViewerId(userId);
    const res = await fetch(`${API_BASE}/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uId, seriesId }),
    });
    return res.json();
  },

  async getBookmarks(userId?: string): Promise<string[]> {
    const uId = getViewerId(userId);
    const res = await fetch(`${API_BASE}/bookmarks/${uId}`);
    const seriesList: Series[] = await res.json();
    return Array.isArray(seriesList) ? seriesList.map((s) => s.id) : [];
  },

  // Comments
  async getComments(episodeId: string): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/comments/episode/${episodeId}`);
    return res.json();
  },

  async getAllComments(): Promise<Comment[]> {
    const res = await fetch(`${API_BASE}/comments/all`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async addComment(
    episodeId: string,
    userId: string,
    userName: string,
    content: string,
    userAvatar?: string
  ): Promise<Comment> {
    const res = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeId, userId, userName, content, userAvatar }),
    });
    return res.json();
  },

  async deleteComment(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.json();
  },

  async toggleHideComment(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/comments/${id}/hide`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    return res.json();
  },

  // Search
  async search(query: string): Promise<{ series: Series[]; episodes: Episode[] }> {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  // Admin Stats & Tools
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },

  async clearAllContent(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/clear-all`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return res.json();
  },
};

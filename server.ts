import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logger for debugging API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// --- ADMIN AUTH ROUTE ---
app.post('/api/auth/admin-login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  const result = db.verifyAdmin(password);
  if (result.success) {
    return res.json({ success: true, token: result.token, name: result.name });
  }
  return res.status(401).json({ error: 'Invalid admin creator password' });
});

// --- VIEWER AUTH ROUTES ---
app.post('/api/auth/viewer-register', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  const user = db.registerViewer(name, email);
  return res.json({ user });
});

app.post('/api/auth/viewer-login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  const users = db.getAllUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) {
    // Auto-create viewer profile for frictionless OTT onboarding
    const user = db.registerViewer(email.split('@')[0], email);
    return res.json({ user });
  }
  return res.json({ user: found });
});

// --- GENRES ---
app.get('/api/genres', (req, res) => {
  res.json(db.getGenres());
});

// --- SERIES ---
app.get('/api/series', (req, res) => {
  const includeUnpublished = req.query.all === 'true';
  const series = db.getAllSeries(includeUnpublished);
  res.json(series);
});

app.get('/api/series/:slug', (req, res) => {
  const series = db.getSeriesBySlug(req.params.slug);
  if (!series) {
    return res.status(404).json({ error: 'Series not found' });
  }
  res.json(series);
});

app.post('/api/series', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const newSeries = db.createSeries(req.body);
  res.status(201).json(newSeries);
});

app.put('/api/series/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const updated = db.updateSeries(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Series not found' });
  res.json(updated);
});

app.delete('/api/series/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const success = db.deleteSeries(req.params.id);
  if (!success) return res.status(404).json({ error: 'Series not found' });
  res.json({ success: true });
});

// --- SEASONS ---
app.post('/api/seasons', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const { seriesId, title } = req.body;
  if (!seriesId) return res.status(400).json({ error: 'Series ID required' });
  const season = db.createSeason(seriesId, title);
  res.status(201).json(season);
});

app.delete('/api/seasons/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const success = db.deleteSeason(req.params.id);
  res.json({ success });
});

// --- EPISODES ---
app.get('/api/episodes', (req, res) => {
  const includeUnpublished = req.query.all === 'true';
  const episodes = db.getAllEpisodes(includeUnpublished);
  res.json(episodes);
});

app.get('/api/episodes/:id', (req, res) => {
  const episode = db.getEpisodeById(req.params.id);
  if (!episode) return res.status(404).json({ error: 'Episode not found' });

  // Compute previous and next episode in the same season or series
  const seasonEpisodes = db.getEpisodesBySeason(episode.seasonId, false);
  const currentIndex = seasonEpisodes.findIndex(e => e.id === episode.id);

  const prevEpisode = currentIndex > 0 ? seasonEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex >= 0 && currentIndex < seasonEpisodes.length - 1 ? seasonEpisodes[currentIndex + 1] : null;

  res.json({
    episode,
    prevEpisode,
    nextEpisode,
  });
});

app.post('/api/episodes', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const newEp = db.createEpisode(req.body);
  res.status(201).json(newEp);
});

app.put('/api/episodes/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const updated = db.updateEpisode(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Episode not found' });
  res.json(updated);
});

app.delete('/api/episodes/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const success = db.deleteEpisode(req.params.id);
  res.json({ success });
});

app.patch('/api/episodes/reorder', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }

  const { seasonId, orderedIds } = req.body;
  if (!seasonId || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'seasonId and orderedIds array required' });
  }
  const success = db.reorderEpisodes(seasonId, orderedIds);
  res.json({ success });
});

// --- VIEWS & PROGRESS ---
app.post('/api/views', (req, res) => {
  const { episodeId, seriesId, durationSeconds } = req.body;
  if (!episodeId || !seriesId) return res.status(400).json({ error: 'Missing fields' });
  db.recordView(episodeId, seriesId, durationSeconds || 0);
  res.json({ success: true });
});

app.post('/api/progress', (req, res) => {
  const { userId, episodeId, seriesId, currentTime, duration } = req.body;
  if (!userId || !episodeId || !seriesId) return res.status(400).json({ error: 'Missing fields' });
  const prog = db.saveProgress(userId, episodeId, seriesId, currentTime, duration);
  res.json(prog);
});

app.get('/api/progress/:userId', (req, res) => {
  const progressList = db.getUserProgress(req.params.userId);
  res.json(progressList);
});

// --- LIKES ---
app.post('/api/likes/toggle', (req, res) => {
  const { userId, episodeId, seriesId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const result = db.toggleLike(userId, episodeId, seriesId);
  res.json(result);
});

app.get('/api/likes/:userId', (req, res) => {
  const likes = db.getUserLikes(req.params.userId);
  res.json(likes);
});

// --- BOOKMARKS ---
app.post('/api/bookmarks/toggle', (req, res) => {
  const { userId, seriesId } = req.body;
  if (!userId || !seriesId) return res.status(400).json({ error: 'userId and seriesId required' });
  const result = db.toggleBookmark(userId, seriesId);
  res.json(result);
});

app.get('/api/bookmarks/:userId', (req, res) => {
  const bookmarks = db.getUserBookmarks(req.params.userId);
  res.json(bookmarks);
});

// --- COMMENTS ---
app.get('/api/comments/episode/:episodeId', (req, res) => {
  const comments = db.getComments(req.params.episodeId);
  res.json(comments);
});

app.get('/api/comments/all', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  const comments = db.getAllComments();
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const { episodeId, userId, userName, content, userAvatar } = req.body;
  if (!episodeId || !userName || !content) {
    return res.status(400).json({ error: 'Missing comment parameters' });
  }
  const comment = db.addComment(episodeId, userId || 'anon-viewer', userName, content, userAvatar);
  res.status(201).json(comment);
});

app.delete('/api/comments/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  const success = db.deleteComment(req.params.id);
  res.json({ success });
});

app.patch('/api/comments/:id/hide', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  const success = db.toggleHideComment(req.params.id);
  res.json({ success });
});

// --- SEARCH ---
app.get('/api/search', (req, res) => {
  const query = (req.query.q as string) || '';
  const results = db.search(query);
  res.json(results);
});

// --- ADMIN STATS & MAINTENANCE ---
app.get('/api/admin/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  const stats = db.getAdminStats();
  res.json(stats);
});

app.post('/api/admin/reset-demo', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  db.resetDemoData();
  res.json({ success: true, message: 'Reset to sample 3 fictional micro-dramas' });
});

app.post('/api/admin/clear-all', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!db.validateAdminToken(token || '')) {
    return res.status(403).json({ error: 'Admin authorization required' });
  }
  db.clearAllContent();
  res.json({ success: true, message: 'All content purged for brand new creator uploads' });
});

// --- VITE MIDDLEWARE & SERVER STARTUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`vudoindia streaming server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

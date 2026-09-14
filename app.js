const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, JS, CSS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to videos database inside the 'data' folder
const VIDEOS_FILE = path.join(__dirname, 'data', 'videos.json');

// Helper function to read videos with fallbacks applied
const readVideosFromFile = (callback) => {
  fs.readFile(VIDEOS_FILE, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return callback(null, []);
      return callback(err, null);
    }
    try {
      const videos = JSON.parse(data || '[]');
      const updatedVideos = videos.map((video) => ({
        ...video,
        url: video.url || video.embed_url,
        category: video.category || "AI",
        views: video.views || 0
      }));
      callback(null, updatedVideos);
    } catch (parseError) {
      callback(parseError, null);
    }
  });
};

// Helper function to write videos
const writeVideosToFile = (data, callback) => {
  fs.writeFile(VIDEOS_FILE, JSON.stringify(data, null, 2), 'utf8', callback);
};

// GET /api/videos - Fetch all videos
app.get('/api/videos', (req, res) => {
  readVideosFromFile((err, videos) => {
    if (err) return res.status(500).json({ error: 'Failed to read videos data.' });
    res.json(videos);
  });
});

// POST /api/videos/:id/view - Increment view count
app.post('/api/videos/:id/view', (req, res) => {
  const videoId = parseInt(req.params.id, 10);

  readVideosFromFile((err, videos) => {
    if (err) return res.status(500).json({ error: 'Failed to read videos data.' });

    const videoIndex = videos.findIndex((v) => v.id === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    videos[videoIndex].views = (videos[videoIndex].views || 0) + 1;

    writeVideosToFile(videos, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Failed to save view.' });
      res.json({ success: true, views: videos[videoIndex].views });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});






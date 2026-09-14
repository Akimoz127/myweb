document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const categoryFilter = document.getElementById('category-filter');

  // Detect current route/page
  const path = window.location.pathname.toLowerCase();
  const isTrending = path.includes('trending') || document.body.classList.contains('trending-page');
  const isFavorites = path.includes('favorites') || document.body.classList.contains('favorites-page');
  
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('cat');
  const searchQuery = urlParams.get('q');

  let allVideos = [];

  async function fetchVideos() {
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch video dataset');
      allVideos = await response.json();

      let displayVideos = [...allVideos];

      // 1. Trending Routing
      if (isTrending) {
        displayVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
      } 
      // 2. Favorites Routing
      else if (isFavorites) {
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        displayVideos = displayVideos.filter(v => favoriteIds.includes(v.id));
      } 
      // 3. Category Page Routing (via URL parameter ?cat=Name)
      else if (categoryParam) {
        displayVideos = displayVideos.filter(v => 
          v.category.toLowerCase() === categoryParam.toLowerCase()
        );
      } 
      // 4. Search Routing (via URL parameter ?q=Query)
      else if (searchQuery) {
        const q = searchQuery.toLowerCase();
        displayVideos = displayVideos.filter(v => 
          v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)
        );
      } 
      // 5. Default Home Page Routing (Newest / All videos)
      else {
        displayVideos.sort((a, b) => (b.id || 0) - (a.id || 0));
      }

      populateCategoryDropdown(allVideos);
      renderVideos(displayVideos);
    } catch (error) {
      console.error(error);
      if (videoContainer) {
        videoContainer.innerHTML = '<p class="error">Unable to load video feed.</p>';
      }
    }
  }

  function populateCategoryDropdown(videos) {
    if (!categoryFilter) return;

    const categories = ['All', ...new Set(videos.map(v => v.category))];
    categoryFilter.innerHTML = categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');

    // Pre-select category if matching URL parameter
    if (categoryParam) {
      const match = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
      if (match) categoryFilter.value = match;
    }

    categoryFilter.addEventListener('change', (e) => {
      const selected = e.target.value;
      const filtered = selected === 'All' 
        ? allVideos 
        : allVideos.filter(v => v.category === selected);
      renderVideos(filtered);
    });
  }

  function renderVideos(videos) {
    if (!videoContainer) return;

    if (!videos || videos.length === 0) {
      videoContainer.innerHTML = '<p class="empty-msg">No videos found for this section.</p>';
      return;
    }

    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');

    videoContainer.innerHTML = videos.map(video => {
      const isFav = favoriteIds.includes(video.id);
      return `
        <div class="video-card" data-id="${video.id}">
          <iframe src="${video.url}" title="${video.title}" frameborder="0" allowfullscreen></iframe>
          <div class="video-info">
            <h3>${video.title}</h3>
            <span class="badge">${video.category}</span>
            <p class="views" id="views-${video.id}">${(video.views || 0).toLocaleString()} views</p>
            <div class="card-actions">
              <button onclick="registerView(${video.id})">Watch</button>
              <button onclick="toggleFavorite(${video.id})" id="fav-btn-${video.id}">
                ${isFav ? '❤️ Saved' : '🤍 Favorite'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  fetchVideos();
});

async function registerView(videoId) {
  try {
    const res = await fetch(`/api/videos/${videoId}/view`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      const el = document.getElementById(`views-${videoId}`);
      if (el) el.textContent = `${data.views.toLocaleString()} views`;
    }
  } catch (err) {
    console.error('Error recording view:', err);
  }
}

function toggleFavorite(videoId) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favorites.includes(videoId)) {
    favorites = favorites.filter(id => id !== videoId);
  } else {
    favorites.push(videoId);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));

  const btn = document.getElementById(`fav-btn-${videoId}`);
  if (btn) {
    btn.textContent = favorites.includes(videoId) ? '❤️ Saved' : '🤍 Favorite';
  }
}

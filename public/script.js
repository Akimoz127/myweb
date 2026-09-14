document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');

  // Detect active page state
  const isTrending = document.body.classList.contains('trending-page') || window.location.pathname.includes('trending');
  const isFavorites = document.body.classList.contains('favorites-page') || window.location.pathname.includes('favorites');
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategoryParam = urlParams.get('cat');
  const searchQueryParam = urlParams.get('q');

  let allVideos = [];

  async function fetchVideos() {
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to fetch videos');
      allVideos = await response.json();

      let displayVideos = [...allVideos];

      // Page Logic Routing
      if (isTrending) {
        // Sort by view count descending
        displayVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (isFavorites) {
        // Filter by localStorage favorites
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        displayVideos = displayVideos.filter(v => favoriteIds.includes(v.id));
      } else if (selectedCategoryParam) {
        // Filter by specific URL category param (e.g. category.html?cat=LLMs)
        displayVideos = displayVideos.filter(v => v.category.toLowerCase() === selectedCategoryParam.toLowerCase());
      } else if (searchQueryParam) {
        // Filter by search query
        const query = searchQueryParam.toLowerCase();
        displayVideos = displayVideos.filter(v => 
          v.title.toLowerCase().includes(query) || 
          v.category.toLowerCase().includes(query)
        );
      }

      populateCategoryDropdown(allVideos);
      renderVideos(displayVideos);
    } catch (error) {
      console.error(error);
      if (videoContainer) {
        videoContainer.innerHTML = '<p class="error">Failed to load content.</p>';
      }
    }
  }

  function populateCategoryDropdown(videos) {
    if (!categoryFilter) return;

    const categories = ['All', ...new Set(videos.map(v => v.category))];
    categoryFilter.innerHTML = categories
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');

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

    if (videos.length === 0) {
      videoContainer.innerHTML = '<p>No videos available.</p>';
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

// View count counter
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

// Favorite button handler
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

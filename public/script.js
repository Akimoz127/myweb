document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const categoriesContainer = document.getElementById('categories-container') || document.getElementById('category-list');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-input');

  // Route & Context Detection
  const path = window.location.pathname;
  const isTrendingPage = path.endsWith('trending.html') || path.endsWith('/trending') || document.body.classList.contains('trending-page');
  const isFavoritesPage = path.endsWith('favorites.html') || path.endsWith('/favorites') || document.body.classList.contains('favorites-page');
  const isCategoriesPage = path.endsWith('categories.html') || path.endsWith('/categories');

  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategoryParam = urlParams.get('cat');
  const searchQueryParam = urlParams.get('q');

  let allVideos = [];
  let currentFilteredVideos = [];

  async function fetchVideos() {
    try {
      let response;
      // Try backend Express route first, fall back to static JSON path for GitHub Pages
      try {
        response = await fetch('/api/videos');
        if (!response.ok) throw new Error('API unavailable');
      } catch (e) {
        response = await fetch('./data/videos.json');
      }

      if (!response.ok) throw new Error('Failed to fetch videos data.');

      const rawVideos = await response.json();

      // Apply default fallbacks
      allVideos = rawVideos.map((video) => ({
        ...video,
        url: video.url || video.embed_url,
        category: video.category || 'AI',
        views: video.views || 0,
      }));

      let displayVideos = [...allVideos];

      // Page-Specific Sorting & Filtering
      if (isTrendingPage) {
        // Sort by highest view count
        displayVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (isFavoritesPage) {
        // Filter by saved IDs in LocalStorage
        const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
        displayVideos = displayVideos.filter((v) => favoriteIds.includes(v.id));
      } else if (selectedCategoryParam) {
        displayVideos = displayVideos.filter(
          (v) => v.category.toLowerCase() === selectedCategoryParam.toLowerCase()
        );
      } else {
        // Newest/Default order for Home
        displayVideos.sort((a, b) => (b.id || 0) - (a.id || 0));
      }

      // Pre-filter if search param exists in URL
      if (searchQueryParam) {
        const query = searchQueryParam.toLowerCase();
        displayVideos = displayVideos.filter((v) =>
          v.title.toLowerCase().includes(query) || v.category.toLowerCase().includes(query)
        );
      }

      currentFilteredVideos = displayVideos;

      if (isCategoriesPage) {
        renderCategoriesPage(allVideos);
      } else {
        renderVideoFeed(currentFilteredVideos);
        setupSearchInput();
        setupCategoryPills();
      }
    } catch (error) {
      console.error('Data loading error:', error);
      if (videoContainer) {
        videoContainer.innerHTML = '<p class="error" style="color: #ff0080; padding: 20px;">Failed to load videos.</p>';
      }
    }
  }

  // Render Grid for Home, Trending, Favorites, Search
  function renderVideoFeed(videos) {
    if (!videoContainer) return;

    if (videos.length === 0) {
      videoContainer.innerHTML = '<p style="color: #94a3b8; grid-column: 1/-1; padding: 20px;">No videos found.</p>';
      return;
    }

    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');

    videoContainer.innerHTML = videos
      .map((video) => {
        const isFav = favoriteIds.includes(video.id);
        return `
        <div class="video-card" data-id="${video.id}">
          <iframe src="${video.url}" title="${video.title}" frameborder="0" allowfullscreen></iframe>
          <div class="video-info">
            <h3>${video.title}</h3>
            <span class="badge">${video.category}</span>
            <p class="views" id="views-${video.id}">${(video.views || 0).toLocaleString()} views</p>
            <div class="card-actions">
              <button onclick="toggleFavorite(${video.id})" id="fav-btn-${video.id}">
                ${isFav ? '❤️ Saved' : '🤍 Favorite'}
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  // Render Grid for Categories Page
  function renderCategoriesPage(videos) {
    const target = categoriesContainer || videoContainer;
    if (!target) return;

    const categories = [...new Set(videos.map((v) => v.category))];

    if (categories.length === 0) {
      target.innerHTML = '<p style="color: #94a3b8;">No categories found.</p>';
      return;
    }

    target.innerHTML = categories
      .map((cat) => {
        const count = videos.filter((v) => v.category === cat).length;
        return `
        <div class="category-card" onclick="window.location.href='category.html?cat=${encodeURIComponent(cat)}'">
          <h3>${cat}</h3>
          <p>${count} Video${count === 1 ? '' : 's'}</p>
        </div>
      `;
      })
      .join('');
  }

  // Real-time Search Handler
  function setupSearchInput() {
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = currentFilteredVideos.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.category.toLowerCase().includes(query)
      );
      renderVideoFeed(filtered);
    });
  }

  // Interactive Category Pills Handler
  function setupCategoryPills() {
    const pills = document.querySelectorAll('.category-pill');
    if (!pills.length) return;

    pills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        pills.forEach((p) => p.classList.remove('active'));
        e.target.classList.add('active');

        const selectedCat = e.target.textContent.trim();

        if (selectedCat === 'All') {
          renderVideoFeed(currentFilteredVideos);
        } else {
          const filtered = currentFilteredVideos.filter(
            (v) =>
              (v.category && v.category.toLowerCase() === selectedCat.toLowerCase()) ||
              (v.title && v.title.toLowerCase().includes(selectedCat.toLowerCase()))
          );
          renderVideoFeed(filtered);
        }
      });
    });
  }

  fetchVideos();
});

// Toggle Favorite Status in LocalStorage
function toggleFavorite(videoId) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favorites.includes(videoId)) {
    favorites = favorites.filter((id) => id !== videoId);
  } else {
    favorites.push(videoId);
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));

  const btn = document.getElementById(`fav-btn-${videoId}`);
  if (btn) {
    btn.textContent = favorites.includes(videoId) ? '❤️ Saved' : '🤍 Favorite';
  }
}

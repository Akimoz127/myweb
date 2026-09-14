document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const categoriesContainer = document.getElementById('categories-container') || document.getElementById('category-list');
  const categoryFilter = document.getElementById('category-filter');

  const isTrending = document.body.classList.contains('trending-page') || window.location.pathname.includes('trending');
  const isFavorites = document.body.classList.contains('favorites-page') || window.location.pathname.includes('favorites');
  const isCategoriesPage = window.location.pathname.includes('categories');

  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategoryParam = urlParams.get('cat');

  let allVideos = [];

  async function fetchVideos() {
    try {
      let response;
      // Try API route first, fall back to static JSON path for GitHub Pages
      try {
        response = await fetch('/api/videos');
        if (!response.ok) throw new Error('API unavailable');
      } catch (e) {
        // Fallback relative path for static hosting (GitHub Pages)
        response = await fetch('./data/videos.json');
      }

      if (!response.ok) throw new Error('Failed to fetch videos.json');

      const rawVideos = await response.json();

      // Apply fallbacks on client side
      allVideos = rawVideos.map((video) => ({
        ...video,
        url: video.url || video.embed_url,
        category: video.category || 'AI',
        views: video.views || 0,
      }));

      if (isCategoriesPage) {
        renderCategoriesPage(allVideos);
      } else {
        renderVideoFeed(allVideos);
      }
    } catch (error) {
      console.error('Data loading error:', error);
      if (videoContainer) {
        videoContainer.innerHTML = '<p style="color:red;">Failed to load videos.</p>';
      }
    }
  }

  // Render Grid for Home, Trending, Favorites, Category Pages
  function renderVideoFeed(videos) {
    let displayVideos = [...videos];

    if (isTrending) {
      displayVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (isFavorites) {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      displayVideos = displayVideos.filter((v) => favoriteIds.includes(v.id));
    } else if (selectedCategoryParam) {
      displayVideos = displayVideos.filter(
        (v) => v.category.toLowerCase() === selectedCategoryParam.toLowerCase()
      );
    }

    populateDropdown(videos);
    renderCards(displayVideos);
  }

  // Render Categories Grid for categories.html
  function renderCategoriesPage(videos) {
    const target = categoriesContainer || videoContainer;
    if (!target) return;

    const categories = [...new Set(videos.map((v) => v.category))];

    if (categories.length === 0) {
      target.innerHTML = '<p>No categories found.</p>';
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

  function populateDropdown(videos) {
    if (!categoryFilter) return;

    const categories = ['All', ...new Set(videos.map((v) => v.category))];
    categoryFilter.innerHTML = categories
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join('');

    categoryFilter.addEventListener('change', (e) => {
      const selected = e.target.value;
      const filtered =
        selected === 'All' ? videos : videos.filter((v) => v.category === selected);
      renderCards(filtered);
    });
  }

  function renderCards(videos) {
    if (!videoContainer) return;

    if (videos.length === 0) {
      videoContainer.innerHTML = '<p>No videos available.</p>';
      return;
    }

    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');

    videoContainer.innerHTML = videos
      .map((video) => {
        const isFav = favoriteIds.includes(video.id);
        return `
        <div class="video-card">
          <iframe src="${video.url}" title="${video.title}" frameborder="0" allowfullscreen></iframe>
          <div class="video-info">
            <h3>${video.title}</h3>
            <span class="badge">${video.category}</span>
            <p class="views">${(video.views || 0).toLocaleString()} views</p>
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

  fetchVideos();
});

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

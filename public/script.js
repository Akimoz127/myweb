document.addEventListener('DOMContentLoaded', () => {
  const videoContainer = document.getElementById('video-container');
  const categoryFilter = document.getElementById('category-filter');

  // Detect current page view (defaults to 'home' if no specific page ID is set)
  const isTrendingPage = window.location.pathname.includes('trending') || document.body.classList.contains('trending-page');

  let allVideos = [];

  async function fetchVideos() {
    try {
      const response = await fetch('/api/videos');
      if (!response.ok) throw new Error('Failed to load videos.');
      allVideos = await response.json();

      let displayVideos = [...allVideos];

      if (isTrendingPage) {
        // Trending Page: Sort by views descending (top viewed)
        displayVideos.sort((a, b) => b.views - a.views);
      } else {
        // Home Page: Regular feed (e.g., newest first or unsorted)
        displayVideos.sort((a, b) => (b.id || 0) - (a.id || 0));
      }

      populateCategories(displayVideos);
      renderVideos(displayVideos);
    } catch (error) {
      console.error(error);
      if (videoContainer) {
        videoContainer.innerHTML = '<p class="error">Error loading videos.</p>';
      }
    }
  }

  function populateCategories(videos) {
    if (!categoryFilter) return;

    const categories = ['All', ...new Set(videos.map((v) => v.category))];
    categoryFilter.innerHTML = categories
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join('');

    categoryFilter.addEventListener('change', (e) => {
      const selected = e.target.value;
      const filtered = selected === 'All' 
        ? videos 
        : videos.filter((v) => v.category === selected);
      renderVideos(filtered);
    });
  }

  function renderVideos(videos) {
    if (!videoContainer) return;

    if (videos.length === 0) {
      videoContainer.innerHTML = '<p>No videos available.</p>';
      return;
    }

    videoContainer.innerHTML = videos
      .map(
        (video) => `
      <div class="video-card" data-id="${video.id}">
        <iframe 
          src="${video.url}" 
          title="${video.title}" 
          frameborder="0" 
          allowfullscreen>
        </iframe>
        <div class="video-info">
          <h3>${video.title}</h3>
          <span class="badge">${video.category}</span>
          <p class="views" id="views-${video.id}">${video.views.toLocaleString()} views</p>
          <button onclick="registerView(${video.id})">Watch</button>
        </div>
      </div>
    `
      )
      .join('');
  }

  fetchVideos();
});

// Function to trigger view increment on backend
async function registerView(videoId) {
  try {
    const res = await fetch(`/api/videos/${videoId}/view`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      const viewElement = document.getElementById(`views-${videoId}`);
      if (viewElement) {
        viewElement.textContent = `${data.views.toLocaleString()} views`;
      }
    }
  } catch (err) {
    console.error('Failed to register view:', err);
  }
}

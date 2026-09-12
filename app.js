// ====== Data Load ======
let videos = [];
let watchLater = JSON.parse(localStorage.getItem("watchLater") || "[]");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let history = JSON.parse(localStorage.getItem("history") || "[]");

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    videos = data;
    initPage();
  });

// ====== Page Init ======
function initPage() {
  const path = window.location.pathname;

  if (path.endsWith("index.html") || path === "/" || path === "") {
    renderFeaturedVideos(videos);
    setupSearchIndex();
    setupDarkNeonBackground();
  } else if (path.endsWith("categories.html")) {
    renderCategories();
    setupSearchCategories();
    setupDarkNeonBackground();
  } else if (path.endsWith("category.html")) {
    setupCategoryPage();
    setupDarkNeonBackground();
  } else if (path.endsWith("trending.html")) {
    renderTrending();
    setupSearchTrending();
    setupDarkNeonBackground();
  } else if (path.endsWith("watch-later.html")) {
    renderWatchLater();
    setupSearchWatchLater();
    setupDarkNeonBackground();
  } else if (path.endsWith("watch.html")) {
    setupWatchPage();
    setupDarkNeonBackground();
  } else {
    setupDarkNeonBackground();
  }
}

// ====== Dark Neon Animation ======
function setupDarkNeonBackground() {
  const body = document.body;
  body.style.backgroundImage =
    "radial-gradient(circle at top left, rgba(0,245,255,0.15), transparent 60%)," +
    "radial-gradient(circle at bottom right, rgba(255,0,150,0.15), transparent 60%)";
  body.style.backgroundAttachment = "fixed";
}

// ====== Render Helpers ======
function renderFeaturedVideos(list) {
  const container = document.getElementById("videoList");
  if (!container) return;
  container.innerHTML = "";
  list.forEach(video => {
    container.innerHTML += createVideoCard(video);
  });
}

function renderCategories(filteredList) {
  const container = document.getElementById("categoryList");
  if (!container) return;

  const categories = filteredList || [...new Set(videos.map(v => v.category))];

  container.innerHTML = "";
  categories.forEach(cat => {
    container.innerHTML += `
      <div class="bg-gray-900 rounded-lg p-4 card-neon cursor-pointer"
           onclick="openCategory('${cat}')">
        <h3 class="text-lg font-semibold text-neon">${cat}</h3>
      </div>
    `;
  });
}

function renderCategoryVideosList(list) {
  const container = document.getElementById("categoryVideos");
  if (!container) return;
  container.innerHTML = "";
  list.forEach(video => {
    container.innerHTML += createVideoCard(video);
  });
}

function renderTrending() {
  const container = document.getElementById("trendingList");
  if (!container) return;

  const sorted = [...videos].sort((a, b) => b.views - a.views);
  container.innerHTML = "";
  sorted.forEach(video => {
    container.innerHTML += createVideoCard(video);
  });
}

function renderWatchLater() {
  const container = document.getElementById("watchLaterList");
  if (!container) return;
  container.innerHTML = "";
  watchLater.forEach(video => {
    container.innerHTML += createVideoCard(video);
  });
}

// ====== Card Component ======
function createVideoCard(video) {
  return `
    <div class="bg-gray-900 rounded-lg overflow-hidden shadow-lg card-neon cursor-pointer"
         onclick="openWatch(${video.id})">
      <img src="${video.thumbnail}" class="w-full h-32 object-cover">
      <div class="p-3">
        <h3 class="text-lg font-semibold">${video.title}</h3>
        <p class="text-gray-400 text-sm">${video.category}</p>
        <p class="text-gray-500 text-xs">${video.views} views</p>
      </div>
    </div>
  `;
}

// ====== Navigation ======
function openCategory(categoryName) {
  window.location.href = `category.html?category=${encodeURIComponent(categoryName)}`;
}

function openWatch(id) {
  window.location.href = `watch.html?id=${id}`;
}

// ====== Category Page Setup ======
function setupCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("category");
  const titleEl = document.getElementById("categoryTitle");
  if (titleEl) titleEl.textContent = categoryName || "Category";

  const list = videos.filter(v => v.category === categoryName);
  renderCategoryVideosList(list);
  setupSearchCategoryPage(categoryName);
}

// ====== Watch Page Setup ======
function setupWatchPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const video = videos.find(v => v.id === id);
  if (!video) return;

  const player = document.getElementById("videoPlayer");
  const titleEl = document.getElementById("videoTitle");
  const watchLaterBtn = document.getElementById("watchLaterBtn");
  const favoriteBtn = document.getElementById("favoriteBtn");

  if (player) player.src = video.url;
  if (titleEl) titleEl.textContent = video.title;

  // Add to history
  addToHistory(video);

  // Watch Later
  if (watchLaterBtn) {
    watchLaterBtn.onclick = () => {
      if (!watchLater.find(v => v.id === video.id)) {
        watchLater.push(video);
        localStorage.setItem("watchLater", JSON.stringify(watchLater));
        watchLaterBtn.textContent = "Added to Watch Later";
      }
    };
  }

  // Favorites
  if (favoriteBtn) {
    favoriteBtn.onclick = () => {
      if (!favorites.find(v => v.id === video.id)) {
        favorites.push(video);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        favoriteBtn.textContent = "Added to Favorites";
      }
    };
  }

  // Recommended
  renderRecommended(video);
}

// ====== History System ======
function addToHistory(video) {
  history = history.filter(v => v.id !== video.id);
  history.unshift(video);
  if (history.length > 20) history.pop();
  localStorage.setItem("history", JSON.stringify(history));
}

// ====== Recommended Videos AI (بسيطة) ======
function renderRecommended(currentVideo) {
  const container = document.getElementById("recommendedVideos");
  if (!container) return;

  const sameCategory = videos.filter(
    v => v.category === currentVideo.category && v.id !== currentVideo.id
  );

  const sorted = sameCategory.sort((a, b) => b.views - a.views).slice(0, 4);

  container.innerHTML = "";
  sorted.forEach(video => {
    container.innerHTML += createVideoCard(video);
  });
}

// ====== Search Systems ======
function setupSearchIndex() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();
    const filtered = videos.filter(v =>
      v.title.toLowerCase().includes(keyword) ||
      v.category.toLowerCase().includes(keyword)
    );
    renderFeaturedVideos(filtered);
  });
}

function setupSearchCategories() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();
    const allCats = [...new Set(videos.map(v => v.category))];
    const filtered = allCats.filter(cat =>
      cat.toLowerCase().includes(keyword)
    );
    renderCategories(filtered);
  });
}

function setupSearchCategoryPage(categoryName) {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();
    const filtered = videos.filter(v =>
      v.category === categoryName &&
      v.title.toLowerCase().includes(keyword)
    );
    renderCategoryVideosList(filtered);
  });
}

function setupSearchTrending() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();
    const sorted = [...videos].sort((a, b) => b.views - a.views);
    const filtered = sorted.filter(v =>
      v.title.toLowerCase().includes(keyword) ||
      v.category.toLowerCase().includes(keyword)
    );
    const container = document.getElementById("trendingList");
    if (!container) return;
    container.innerHTML = "";
    filtered.forEach(video => {
      container.innerHTML += createVideoCard(video);
    });
  });
}

function setupSearchWatchLater() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();
    const filtered = watchLater.filter(v =>
      v.title.toLowerCase().includes(keyword) ||
      v.category.toLowerCase().includes(keyword)
    );
    const container = document.getElementById("watchLaterList");
    if (!container) return;
    container.innerHTML = "";
    filtered.forEach(video => {
      container.innerHTML += createVideoCard(video);
    });
  });
}



// =====================================================
// Akimoz AI Learning Stream — Unified App Logic
// =====================================================

// Global video storage
let allVideos = [];

// Load videos.json once
fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    allVideos = data;
    initPage();
  })
  .catch(err => console.error("Error loading videos:", err));


// =====================================================
// Detect current page and run its logic
// =====================================================

function initPage() {
  renderCategories();
  renderCategoryVideos();
  renderTrending();
  renderWatchLater();
  renderFavorites();
  renderWatchPage();
  renderSearch();
}


// =====================================================
// Helper: Get URL parameter
// =====================================================

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}


// =====================================================
// PAGE: categories.html
// =====================================================

function renderCategories() {
  const container = document.getElementById("categoryList");
  if (!container) return;

  const categories = [...new Set(allVideos.map(v => v.category))];

  categories.forEach(cat => {
    const card = document.createElement("a");
    card.href = `category.html?name=${encodeURIComponent(cat)}`;
    card.className = "card-neon block";

    card.innerHTML = `
      <h3 class="text-neon font-bold mb-2">${cat}</h3>
      <p class="text-gray-400">Explore videos in ${cat}</p>
    `;

    container.appendChild(card);
  });
}


// =====================================================
// PAGE: category.html
// =====================================================

function renderCategoryVideos() {
  const container = document.getElementById("videoList");
  const header = document.getElementById("categoryHeader");
  if (!container || !header) return;

  const categoryName = getParam("name");
  header.innerHTML = `
    <h2 class="text-neon text-xl font-bold mb-3">${categoryName}</h2>
    <p class="text-gray-300">Videos related to ${categoryName}</p>
  `;

  const filtered = allVideos.filter(v => v.category === categoryName);

  filtered.forEach(v => {
    const card = document.createElement("a");
    card.href = `watch.html?id=${v.id}`;
    card.className = "card-neon block";

    card.innerHTML = `
      <h3 class="text-neon font-bold mb-2">${v.title}</h3>
      <p class="text-gray-400">${v.category}</p>
      <p class="text-gray-500 text-sm">Watch →</p>
    `;

    container.appendChild(card);
  });
}


// =====================================================
// PAGE: trending.html
// =====================================================

function renderTrending() {
  const container = document.getElementById("trendingList");
  if (!container) return;

  const trending = allVideos.filter(v => v.trending === true);

  trending.forEach(v => {
    const card = document.createElement("a");
    card.href = `watch.html?id=${v.id}`;
    card.className = "card-neon block";

    card.innerHTML = `
      <h3 class="text-neon font-bold mb-2">${v.title}</h3>
      <p class="text-gray-400">${v.category}</p>
      <p class="text-gray-500 text-sm">Watch →</p>
    `;

    container.appendChild(card);
  });
}


// =====================================================
// PAGE: watch-later.html
// =====================================================

function renderWatchLater() {
  const container = document.getElementById("laterList");
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem("watchLater") || "[]");

  if (saved.length === 0) {
    container.innerHTML = `
      <div class="card-neon col-span-3 text-center">
        <p class="text-gray-300">No videos saved for later.</p>
      </div>
    `;
    return;
  }

  saved.forEach(id => {
    const v = allVideos.find(video => video.id == id);
    if (!v) return;

    const card = document.createElement("a");
    card.href = `watch.html?id=${v.id}`;
    card.className = "card-neon block";

    card.innerHTML = `
      <h3 class="text-neon font-bold mb-2">${v.title}</h3>
      <p class="text-gray-400">${v.category}</p>
      <p class="text-gray-500 text-sm">Watch →</p>
    `;

    container.appendChild(card);
  });
}


// =====================================================
// PAGE: favorites.html
// =====================================================

function renderFavorites() {
  const container = document.getElementById("favoritesList");
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (saved.length === 0) {
    container.innerHTML = `
      <div class="card-neon col-span-3 text-center">
        <p class="text-gray-300">No favorite videos yet.</p>
      </div>
    `;
    return;
  }

  saved.forEach(id => {
    const v = allVideos.find(video => video.id == id);
    if (!v) return;

    const card = document.createElement("a");
    card.href = `watch.html?id=${v.id}`;
    card.className = "card-neon block";

    card.innerHTML = `
      <h3 class="text-neon font-bold mb-2">${v.title}</h3>
      <p class="text-gray-400">${v.category}</p>
      <p class="text-gray-500 text-sm">Watch →</p>
    `;

    container.appendChild(card);
  });
}


// =====================================================
// PAGE: watch.html
// =====================================================

function renderWatchPage() {
  const container = document.getElementById("videoContainer");
  if (!container) return;

  const id = getParam("id");
  const video = allVideos.find(v => v.id == id);

  container.innerHTML = `
    <div class="card-neon mb-6">
      <h2 class="text-neon text-xl font-bold mb-3">${video.title}</h2>
      <p class="text-gray-400 mb-4">${video.category}</p>

      <iframe width="100%" height="315"
        src="${video.url}"
        frameborder="0"
        allowfullscreen
        class="rounded-lg mb-4">
      </iframe>

      <p class="text-gray-300">${video.description}</p>
    </div>
  `;

  // Buttons
  const favBtn = document.getElementById("favoriteBtn");
  const laterBtn = document.getElementById("watchLaterBtn");

  favBtn.onclick = () => {
    let fav = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!fav.includes(id)) {
      fav.push(id);
      localStorage.setItem("favorites", JSON.stringify(fav));
    }
  };

  laterBtn.onclick = () => {
    let later = JSON.parse(localStorage.getItem("watchLater") || "[]");
    if (!later.includes(id)) {
      later.push(id);
      localStorage.setItem("watchLater", JSON.stringify(later));
    }
  };

  // Recommended videos
  const recommended = allVideos.filter(v => v.category === video.category && v.id != id);
  const list = document.getElementById("recommendedList");

  recommended.forEach(v => {
    const card = document.createElement("a");
    card.href = `watch.html?id=${v.id}`;
    card.className = "card-neon block";

    card.innerHTML = `
      <h3 class="text-neon font-bold mb-2">${v.title}</h3>
      <p class="text-gray-400">${v.category}</p>
      <p class="text-gray-500 text-sm">Watch →</p>
    `;

    list.appendChild(card);
  });
}


// =====================================================
// PAGE: search.html
// =====================================================

function renderSearch() {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    results.innerHTML = "";

    if (q.trim() === "") return;

    const filtered = allVideos.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      results.innerHTML = `
        <div class="card-neon col-span-3 text-center">
          <p class="text-gray-300">No results found.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(v => {
      const card = document.createElement("a");
      card.href = `watch.html?id=${v.id}`;
      card.className = "card-neon block";

      card.innerHTML = `
        <h3 class="text-neon font-bold mb-2">${v.title}</h3>
        <p class="text-gray-400">${v.category}</p>
        <p class="text-gray-500 text-sm">Watch →</p>
      `;

      results.appendChild(card);
    });
  });
}






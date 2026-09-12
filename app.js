// ===============================
// تحميل الفيديوهات من videos.json
// ===============================

let allVideos = [];

fetch("videos.json")
  .then(res => res.json())
  .then(data => {
    allVideos = data;
    initPages();
  })
  .catch(err => console.error("Error loading videos:", err));


// ===============================
// تفعيل الدوال حسب الصفحة الحالية
// ===============================

function initPages() {
  renderCategories(allVideos);
  renderCategoryVideos(allVideos);
  renderTrending(allVideos);
  renderWatchLater(allVideos);
  renderWatchPage(allVideos);
}


// ===============================
// صفحة الأقسام categories.html
// ===============================

function renderCategories(videos) {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  const categories = [...new Set(videos.map(v => v.category))];

  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className =
      "card-neon p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 flex justify-between";

    div.innerHTML = `
      <span class="font-bold">${cat}</span>
      <span class="text-xs text-gray-400">View →</span>
    `;

    div.onclick = () => {
      window.location.href = `category.html?name=${encodeURIComponent(cat)}`;
    };

    categoryList.appendChild(div);
  });
}


// ===============================
// صفحة عرض فيديوهات القسم category.html
// ===============================

function renderCategoryVideos(videos) {
  const container = document.getElementById("categoryVideos");
  const title = document.getElementById("categoryTitle");
  if (!container || !title) return;

  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("name");
  if (!categoryName) return;

  title.textContent = categoryName;

  const filtered = videos.filter(v => v.category === categoryName);

  filtered.forEach(video => {
    const div = document.createElement("div");
    div.className = "card-neon p-4 bg-gray-800 rounded-lg cursor-pointer";

    div.innerHTML = `
      <img src="${video.thumbnail}" class="rounded-lg mb-2">
      <h3 class="font-bold">${video.title}</h3>
      <p class="text-xs text-gray-400">${video.views} views</p>
    `;

    div.onclick = () => {
      window.location.href = `watch.html?id=${video.id}`;
    };

    container.appendChild(div);
  });
}


// ===============================
// صفحة Trending
// ===============================

function renderTrending(videos) {
  const trendingList = document.getElementById("trendingList");
  if (!trendingList) return;

  const sorted = [...videos].sort((a, b) => b.views - a.views).slice(0, 9);

  sorted.forEach(video => {
    const div = document.createElement("div");
    div.className = "card-neon p-4 bg-gray-800 rounded-lg cursor-pointer";

    div.innerHTML = `
      <img src="${video.thumbnail}" class="rounded-lg mb-2">
      <h3 class="font-bold">${video.title}</h3>
      <p class="text-xs text-gray-400">${video.views} views</p>
    `;

    div.onclick = () => {
      window.location.href = `watch.html?id=${video.id}`;
    };

    trendingList.appendChild(div);
  });
}


// ===============================
// نظام Watch Later
// ===============================

// حفظ الفيديو في LocalStorage
function addToWatchLater(videoId) {
  const key = "watchLaterList";
  const current = JSON.parse(localStorage.getItem(key) || "[]");

  if (!current.includes(videoId)) {
    current.push(videoId);
    localStorage.setItem(key, JSON.stringify(current));
  }
}

// عرض قائمة Watch Later
function renderWatchLater(videos) {
  const container = document.getElementById("watchLaterList");
  if (!container) return;

  const key = "watchLaterList";
  const ids = JSON.parse(localStorage.getItem(key) || "[]");

  const filtered = videos.filter(v => ids.includes(v.id));

  filtered.forEach(video => {
    const div = document.createElement("div");
    div.className = "card-neon p-4 bg-gray-800 rounded-lg cursor-pointer";

    div.innerHTML = `
      <img src="${video.thumbnail}" class="rounded-lg mb-2">
      <h3 class="font-bold">${video.title}</h3>
      <p class="text-xs text-gray-400">${video.views} views</p>
    `;

    div.onclick = () => {
      window.location.href = `watch.html?id=${video.id}`;
    };

    container.appendChild(div);
  });
}


// ===============================
// صفحة watch.html
// ===============================

function renderWatchPage(videos) {
  const videoContainer = document.getElementById("videoPlayer");
  const title = document.getElementById("videoTitle");
  const watchLaterBtn = document.getElementById("watchLaterBtn");

  if (!videoContainer || !title) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const video = videos.find(v => v.id === id);

  if (!video) return;

  videoContainer.src = video.url;
  title.textContent = video.title;

  if (watchLaterBtn) {
    watchLaterBtn.onclick = () => addToWatchLater(video.id);
  }
}


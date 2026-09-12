// Video Data
const videos = [
  {
    title: "Nature Live Stream",
    thumbnail: "https://placehold.co/600x400?text=Nature",
    url: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    title: "Tech Talk Live",
    thumbnail: "https://placehold.co/600x400?text=Tech",
    url: "https://www.w3schools.com/html/movie.mp4"
  },
  {
    title: "Gaming Stream",
    thumbnail: "https://placehold.co/600x400?text=Gaming",
    url: "https://placehold.co/600x400"
  }
];

const videoList = document.getElementById("video-list");

// Render All Videos
function renderVideos() {
  videoList.innerHTML = "";

  videos.forEach(video => {
    const card = `
      <div class="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition cursor-pointer"
           onclick="playVideo('${video.url}', '${video.title}')">
        <img src="${video.thumbnail}" class="w-full h-32 object-cover">
        <div class="p-3">
          <h3 class="text-lg font-semibold">${video.title}</h3>
          <p class="text-gray-400 text-sm">Click to play</p>
        </div>
      </div>
    `;
    videoList.innerHTML += card;
  });
}

renderVideos();

// Search System
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
  const keyword = searchInput.value.toLowerCase();

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(keyword)
  );

  renderFilteredVideos(filteredVideos);
});

function renderFilteredVideos(list) {
  videoList.innerHTML = "";

  list.forEach(video => {
    const card = `
      <div class="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition cursor-pointer"
           onclick="playVideo('${video.url}', '${video.title}')">
        <img src="${video.thumbnail}" class="w-full h-32 object-cover">
        <div class="p-3">
          <h3 class="text-lg font-semibold">${video.title}</h3>
          <p class="text-gray-400 text-sm">Click to play</p>
        </div>
      </div>
    `;
    videoList.innerHTML += card;
  });
}

// Video Player
function playVideo(url, title) {
  const player = document.getElementById("player");
  const videoPlayer = document.getElementById("videoPlayer");

  videoPlayer.src = url;
  videoPlayer.play();

  player.classList.remove("hidden");
}

function closePlayer() {
  const player = document.getElementById("player");
  const videoPlayer = document.getElementById("videoPlayer");

  videoPlayer.pause();
  player.classList.add("hidden");
}

fetch("videos.json")
  .then(response => response.json())
  .then(videos => {
    renderVideos(videos);
  });

---
function renderCategories(videos) {
  const categoryList = document.getElementById("categoryList");
  if (!categoryList) return;

  const categories = [...new Set(videos.map(v => v.category))];

  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700";
    div.textContent = cat;

    div.onclick = () => {
      window.location.href = `category.html?name=${cat}`;
    };

    categoryList.appendChild(div);
  });
}

function addToWatchLater(videoId) {
  const key = "watchLaterList";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  if (!current.includes(videoId)) {
    current.push(videoId);
    localStorage.setItem(key, JSON.stringify(current));
  }
}

function renderTrending(videos) {
  const trendingList = document.getElementById("trendingList");
  if (!trendingList) return;

  // ترتيب الفيديوهات حسب عدد المشاهدات
  const sorted = [...videos].sort((a, b) => b.views - a.views).slice(0, 9);

  sorted.forEach(video => {
    const div = document.createElement("div");
    div.className = "card-neon p-4 bg-gray-800 rounded-lg cursor-pointer";

    div.innerHTML = `
      <img src="${video.thumbnail}" class="rounded-lg mb-2">
      <h3 class="font-bold mb-1">${video.title}</h3>
      <p class="text-xs text-gray-400">${video.views} views</p>
    `;

    div.onclick = () => {
      window.location.href = `watch.html?id=${video.id}`;
    };

    trendingList.appendChild(div);
  });
}

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


---

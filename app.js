// app.js - Main Application Logic for Video Gallery

let videosData = [];
let activeCategory = 'All';

// Fetch and initialize video data
async function initApp() {
    try {
        const response = await fetch('videos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        videosData = await response.json();
        renderGrid(videosData);
        setupEventListeners();
    } catch (error) {
        console.error("Failed to load videos data:", error);
    }
}

// Render video cards in the grid container
function renderGrid(videos) {
    const gridContainer = document.getElementById('grid-container');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    if (videos.length === 0) {
        gridContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #aaa;">No matching videos found.</p>';
        return;
    }

    videos.forEach(video => {
        const card = createVideoCard(video);
        gridContainer.appendChild(card);
    });
}

// Create individual video card element
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';

    // Fallback values for updated data properties
    const videoUrl = video.url || video.embed_url;
    const category = video.category || "AI";
    const views = video.views || 0;

    card.innerHTML = `
        <div class="thumbnail-container">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            <span class="category-badge">${category}</span>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-meta">
                <span class="views">${views} views</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        if (videoUrl) {
            openModal(videoUrl);
        }
    });

    return card;
}

// Filter videos based on search input and category selection
function filterVideos() {
    const searchInput = document.getElementById('search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = videosData.filter(video => {
        const title = video.title ? video.title.toLowerCase() : '';
        const category = video.category || "AI";

        const matchesSearch = title.includes(searchVal);
        let matchesCategory = true;

        if (activeCategory === 'Arabic') {
            matchesCategory = /[\u0600-\u06FF]/.test(title);
        } else if (activeCategory !== 'All') {
            matchesCategory = category.toLowerCase().includes(activeCategory.toLowerCase()) || 
                              title.toLowerCase().includes(activeCategory.toLowerCase());
        }

        return matchesSearch && matchesCategory;
    });

    renderGrid(filtered);
}

// Category selection handler
function filterCategory(category, btnElement) {
    activeCategory = category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (btnElement) {
        btnElement.classList.add('active');
    }

    filterVideos();
}

// Setup event listeners for inputs & controls
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterVideos);
    }

    const modal = document.getElementById('video-modal');
    if (modal) {
        modal.addEventListener('click', closeModal);
    }
}

// Open modal and embed iframe
function openModal(embedUrl) {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-iframe');

    if (modal && iframe) {
        iframe.src = embedUrl.includes('?') ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;
        modal.classList.add('active');
    }
}

// Close modal and clear iframe src
function closeModal() {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('modal-iframe');

    if (modal && iframe) {
        iframe.src = '';
        modal.classList.remove('active');
    }
}

// Expose handlers globally for HTML inline onclick event bindings
window.filterCategory = filterCategory;
window.closeModal = closeModal;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);






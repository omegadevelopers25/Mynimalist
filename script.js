// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyCov9Fdbq1T0LS2z5xUClFYnyTdcnGGMUU';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// App State
let currentTrack = null;
let currentPlaylist = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'none'; // 'none', 'one', 'all'
let likedTracks = new Set();
let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
let currentPlaylistId = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const playerSection = document.getElementById('playerSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const playlistsSection = document.getElementById('playlistsSection');
const playlistsContainer = document.getElementById('playlistsContainer');
const themeToggle = document.getElementById('themeToggle');

// Currently Playing Card Elements
const currentlyPlayingCard = document.getElementById('currentlyPlayingCard');
const cardThumbnail = document.getElementById('cardThumbnail');
const cardTitle = document.getElementById('cardTitle');
const cardArtist = document.getElementById('cardArtist');
const cardProgress = document.getElementById('cardProgress');
const cardCurrentTime = document.getElementById('cardCurrentTime');
const cardDuration = document.getElementById('cardDuration');
const cardPlayPause = document.getElementById('cardPlayPause');
const cardNext = document.getElementById('cardNext');
const cardLike = document.getElementById('cardLike');

// Player Elements
const trackThumbnail = document.getElementById('trackThumbnail');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const likeBtn = document.getElementById('likeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const addToPlaylistBtn = document.getElementById('addToPlaylistBtn');
const progressSlider = document.getElementById('progressSlider');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');

// Modal Elements
const createPlaylistModal = document.getElementById('createPlaylistModal');
const addToPlaylistModal = document.getElementById('addToPlaylistModal');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeAddToPlaylistBtn = document.getElementById('closeAddToPlaylistBtn');
const playlistNameInput = document.getElementById('playlistNameInput');
const playlistDescriptionInput = document.getElementById('playlistDescriptionInput');
const savePlaylistBtn = document.getElementById('savePlaylistBtn');
const cancelPlaylistBtn = document.getElementById('cancelPlaylistBtn');
const playlistSelection = document.getElementById('playlistSelection');

// Audio Element
const audio = new Audio();

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadPlaylists();
    loadLikedTracks();
});

function initializeApp() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', savedTheme === 'light');
    updateThemeIcon(savedTheme);
    
    // Initialize audio
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('error', handleAudioError);
}

function setupEventListeners() {
    // Search
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Player Controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    likeBtn.addEventListener('click', toggleLike);
    downloadBtn.addEventListener('click', downloadTrack);
    addToPlaylistBtn.addEventListener('click', showAddToPlaylistModal);

    // Currently Playing Card Controls
    cardPlayPause.addEventListener('click', togglePlayPause);
    cardNext.addEventListener('click', playNext);
    cardLike.addEventListener('click', toggleLike);
    
    // Card thumbnail click to show full player
    cardThumbnail.addEventListener('click', () => {
        if (currentTrack) {
            showPlayerSection();
        }
    });
    
    // Card title/artist click to show full player
    cardTitle.addEventListener('click', () => {
        if (currentTrack) {
            showPlayerSection();
        }
    });
    
    cardArtist.addEventListener('click', () => {
        if (currentTrack) {
            showPlayerSection();
        }
    });

    // Progress
    progressSlider.addEventListener('input', seekTo);

    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Playlist Management
    createPlaylistBtn.addEventListener('click', showCreatePlaylistModal);
    closeModalBtn.addEventListener('click', hideCreatePlaylistModal);
    closeAddToPlaylistBtn.addEventListener('click', hideAddToPlaylistModal);
    savePlaylistBtn.addEventListener('click', createPlaylist);
    cancelPlaylistBtn.addEventListener('click', hideCreatePlaylistModal);

    // Modal Click Outside
    createPlaylistModal.addEventListener('click', (e) => {
        if (e.target === createPlaylistModal) hideCreatePlaylistModal();
    });
    addToPlaylistModal.addEventListener('click', (e) => {
        if (e.target === addToPlaylistModal) hideAddToPlaylistModal();
    });
}

// Search Functionality
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    showLoading();
    
    try {
        const results = await searchYouTube(query);
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search for music. Please try again.');
    }
}

async function searchYouTube(query) {
    const response = await fetch(
        `${YOUTUBE_API_URL}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&maxResults=20`
    );
    
    if (!response.ok) {
        throw new Error('YouTube API request failed');
    }
    
    const data = await response.json();
    return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: null // YouTube API doesn't provide duration in search results
    }));
}

function displaySearchResults(results) {
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-music"></i>
                <h3>No results found</h3>
                <p>Try searching for a different song or artist</p>
            </div>
        `;
        return;
    }

    results.forEach(track => {
        const trackCard = createTrackCard(track);
        resultsContainer.appendChild(trackCard);
    });
}

function createTrackCard(track) {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.innerHTML = `
        <img src="${track.thumbnail}" alt="${track.title}" class="track-card-thumbnail">
        <div class="track-card-info">
            <h4 class="track-card-title">${track.title}</h4>
            <p class="track-card-artist">${track.artist}</p>
        </div>
        <div class="track-card-actions">
            <button class="track-card-btn" onclick="playTrack('${track.id}', '${track.title}', '${track.artist}', '${track.thumbnail}')" title="Play">
                <i class="fas fa-play"></i>
            </button>
            <button class="track-card-btn" onclick="addToQueue('${track.id}', '${track.title}', '${track.artist}', '${track.thumbnail}')" title="Add to Queue">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    return card;
}

// Player Functionality
function playTrack(id, title, artist, thumbnail) {
    currentTrack = { id, title, artist, thumbnail };
    currentPlaylist = [{ id, title, artist, thumbnail }];
    currentIndex = 0;
    
    updatePlayerUI();
    loadAndPlayTrack();
    showPlayerSection();
    showCurrentlyPlayingCard();
}

function addToQueue(id, title, artist, thumbnail) {
    const track = { id, title, artist, thumbnail };
    currentPlaylist.push(track);
    
    if (currentPlaylist.length === 1) {
        playTrack(id, title, artist, thumbnail);
    }
}

async function loadAndPlayTrack() {
    if (!currentTrack) return;
    
    try {
        // Try to get video info first
        const response = await fetch(`http://localhost:3000/info/${currentTrack.id}`);
        if (response.ok) {
            const info = await response.json();
            currentTrack.duration = parseInt(info.duration);
            updatePlayerUI();
        }
        
        // For demo purposes, we'll use a placeholder audio source
        // In a real implementation, you'd stream the audio from the server
        audio.src = `https://www.youtube.com/watch?v=${currentTrack.id}`;
        audio.load();
        
        // Since we can't directly play YouTube audio due to CORS,
        // we'll simulate the player functionality
        updatePlayerUI();
    } catch (error) {
        console.error('Error loading track:', error);
        showMessage('Unable to load track. This is a demo version.');
    }
}

function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audio.play().catch(error => {
            console.error('Playback failed:', error);
            showError('Unable to play this track. This is a demo version.');
        });
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    // Update card play button
    updateCardPlayButton();
}

function playPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        currentTrack = currentPlaylist[currentIndex];
        loadAndPlayTrack();
    }
}

function playNext() {
    if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        currentTrack = currentPlaylist[currentIndex];
        loadAndPlayTrack();
    } else if (repeatMode === 'all') {
        currentIndex = 0;
        currentTrack = currentPlaylist[currentIndex];
        loadAndPlayTrack();
    }
}

function handleTrackEnd() {
    if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNext();
    }
    
    // If no more tracks, hide the card
    if (!currentTrack) {
        hideCurrentlyPlayingCard();
    }
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    
    if (isShuffled && currentPlaylist.length > 1) {
        shufflePlaylist();
    }
}

function shufflePlaylist() {
    const currentTrackId = currentTrack?.id;
    const shuffled = [...currentPlaylist];
    
    // Remove current track from shuffle
    const currentIndex = shuffled.findIndex(track => track.id === currentTrackId);
    if (currentIndex > -1) {
        shuffled.splice(currentIndex, 1);
    }
    
    // Shuffle remaining tracks
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Put current track at the beginning
    if (currentTrackId) {
        shuffled.unshift(currentTrack);
    }
    
    currentPlaylist = shuffled;
    currentIndex = 0;
}

function toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentModeIndex + 1) % modes.length];
    
    repeatBtn.classList.toggle('active', repeatMode !== 'none');
    repeatBtn.title = `Repeat: ${repeatMode}`;
}

function toggleLike() {
    if (!currentTrack) return;
    
    const trackId = currentTrack.id;
    if (likedTracks.has(trackId)) {
        likedTracks.delete(trackId);
        likeBtn.innerHTML = '<i class="far fa-heart"></i>';
        likeBtn.classList.remove('active');
    } else {
        likedTracks.add(trackId);
        likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
        likeBtn.classList.add('active');
    }
    
    saveLikedTracks();
}

function downloadTrack() {
    if (!currentTrack) return;
    
    try {
        // Create download link
        const downloadUrl = `http://localhost:3000/download/${currentTrack.id}`;
        
        // Create temporary link element
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${currentTrack.title}.mp3`;
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('Download started!');
    } catch (error) {
        console.error('Download error:', error);
        showMessage('Download failed. Make sure the server is running.');
    }
}

function seekTo() {
    const seekTime = (progressSlider.value / 100) * audio.duration;
    audio.currentTime = seekTime;
}

function updateProgress() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressSlider.value = progress;
        currentTime.textContent = formatTime(audio.currentTime);
        
        // Update card progress
        updateCardProgress();
    }
}

function updateDuration() {
    duration.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updatePlayerUI() {
    if (!currentTrack) return;
    
    trackThumbnail.src = currentTrack.thumbnail;
    trackTitle.textContent = currentTrack.title;
    trackArtist.textContent = currentTrack.artist;
    
    // Update like button
    const isLiked = likedTracks.has(currentTrack.id);
    likeBtn.innerHTML = isLiked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    likeBtn.classList.toggle('active', isLiked);
    
    // Reset progress
    progressSlider.value = 0;
    currentTime.textContent = '0:00';
    duration.textContent = '0:00';
    
    // Update currently playing card
    updateCurrentlyPlayingCard();
}

function updateCurrentlyPlayingCard() {
    if (!currentTrack) {
        hideCurrentlyPlayingCard();
        return;
    }
    
    // Update card content
    cardThumbnail.src = currentTrack.thumbnail;
    cardTitle.textContent = currentTrack.title;
    cardArtist.textContent = currentTrack.artist;
    
    // Update like button
    const isLiked = likedTracks.has(currentTrack.id);
    cardLike.innerHTML = isLiked ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
    cardLike.classList.toggle('active', isLiked);
    
    // Show the card
    showCurrentlyPlayingCard();
}

function showCurrentlyPlayingCard() {
    currentlyPlayingCard.style.display = 'block';
    // Add a small delay to ensure smooth animation
    setTimeout(() => {
        currentlyPlayingCard.style.opacity = '1';
    }, 10);
}

function hideCurrentlyPlayingCard() {
    currentlyPlayingCard.style.opacity = '0';
    setTimeout(() => {
        currentlyPlayingCard.style.display = 'none';
    }, 300);
}

function updateCardProgress() {
    if (!audio.duration) return;
    
    const progress = (audio.currentTime / audio.duration) * 100;
    cardProgress.style.width = `${progress}%`;
    cardCurrentTime.textContent = formatTime(audio.currentTime);
    cardDuration.textContent = formatTime(audio.duration);
}

function updateCardPlayButton() {
    const icon = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    cardPlayPause.innerHTML = `<i class="${icon}"></i>`;
}

function showPlayerSection() {
    playerSection.style.display = 'block';
    playerSection.scrollIntoView({ behavior: 'smooth' });
}

// Playlist Management
function showCreatePlaylistModal() {
    createPlaylistModal.classList.add('show');
    playlistNameInput.focus();
}

function hideCreatePlaylistModal() {
    createPlaylistModal.classList.remove('show');
    playlistNameInput.value = '';
    playlistDescriptionInput.value = '';
}

function createPlaylist() {
    const name = playlistNameInput.value.trim();
    if (!name) return;
    
    const playlist = {
        id: Date.now().toString(),
        name,
        description: playlistDescriptionInput.value.trim(),
        tracks: [],
        createdAt: new Date().toISOString()
    };
    
    playlists.push(playlist);
    savePlaylists();
    loadPlaylists();
    hideCreatePlaylistModal();
    showMessage('Playlist created successfully!');
}

function showAddToPlaylistModal() {
    if (!currentTrack) return;
    
    playlistSelection.innerHTML = '';
    
    if (playlists.length === 0) {
        playlistSelection.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <h3>No playlists yet</h3>
                <p>Create a playlist first to add tracks</p>
            </div>
        `;
    } else {
        playlists.forEach(playlist => {
            const option = document.createElement('div');
            option.className = 'playlist-option';
            option.innerHTML = `
                <input type="radio" name="playlist" value="${playlist.id}" id="playlist-${playlist.id}">
                <label for="playlist-${playlist.id}">
                    <strong>${playlist.name}</strong>
                    <br>
                    <small>${playlist.tracks.length} tracks</small>
                </label>
            `;
            option.addEventListener('click', () => {
                addTrackToPlaylist(playlist.id);
            });
            playlistSelection.appendChild(option);
        });
    }
    
    addToPlaylistModal.classList.add('show');
}

function hideAddToPlaylistModal() {
    addToPlaylistModal.classList.remove('show');
}

function addTrackToPlaylist(playlistId) {
    if (!currentTrack) return;
    
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    
    // Check if track already exists in playlist
    const exists = playlist.tracks.some(track => track.id === currentTrack.id);
    if (exists) {
        showMessage('Track already exists in this playlist');
        return;
    }
    
    playlist.tracks.push(currentTrack);
    savePlaylists();
    loadPlaylists();
    hideAddToPlaylistModal();
    showMessage('Track added to playlist!');
}

function loadPlaylists() {
    playlistsContainer.innerHTML = '';
    
    if (playlists.length === 0) {
        playlistsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <h3>No playlists yet</h3>
                <p>Create your first playlist to organize your music</p>
            </div>
        `;
        return;
    }
    
    playlists.forEach(playlist => {
        const playlistCard = createPlaylistCard(playlist);
        playlistsContainer.appendChild(playlistCard);
    });
}

function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
        <h3>${playlist.name}</h3>
        <p>${playlist.description || 'No description'}</p>
        <div class="playlist-stats">
            <span>${playlist.tracks.length} tracks</span>
            <span>Created ${new Date(playlist.createdAt).toLocaleDateString()}</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        playPlaylist(playlist);
    });
    
    return card;
}

function playPlaylist(playlist) {
    if (playlist.tracks.length === 0) {
        showMessage('This playlist is empty');
        return;
    }
    
    currentPlaylist = [...playlist.tracks];
    currentIndex = 0;
    currentTrack = currentPlaylist[0];
    
    updatePlayerUI();
    loadAndPlayTrack();
    showPlayerSection();
    showCurrentlyPlayingCard();
    showMessage(`Playing playlist: ${playlist.name}`);
}

// Theme Management
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon(isLight ? 'light' : 'dark');
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// Utility Functions
function showLoading() {
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

function showMessage(message) {
    // Create a temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

function handleAudioError(error) {
    console.error('Audio error:', error);
    showError('Unable to play this track. This is a demo version.');
}

// Data Persistence
function savePlaylists() {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

function loadLikedTracks() {
    const saved = localStorage.getItem('likedTracks');
    if (saved) {
        likedTracks = new Set(JSON.parse(saved));
    }
}

function saveLikedTracks() {
    localStorage.setItem('likedTracks', JSON.stringify([...likedTracks]));
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            playPrevious();
            break;
        case 'ArrowRight':
            e.preventDefault();
            playNext();
            break;
        case 'KeyL':
            e.preventDefault();
            toggleLike();
            break;
        case 'KeyS':
            e.preventDefault();
            toggleShuffle();
            break;
        case 'KeyR':
            e.preventDefault();
            toggleRepeat();
            break;
    }
});

// Initialize playlists section visibility
function togglePlaylistsSection() {
    playlistsSection.style.display = playlistsSection.style.display === 'none' ? 'block' : 'none';
}

// Add navigation between sections
function showPlaylists() {
    playlistsSection.style.display = 'block';
    playlistsSection.scrollIntoView({ behavior: 'smooth' });
}

// Add a simple navigation
document.addEventListener('DOMContentLoaded', function() {
    // Add a simple way to navigate to playlists
    const header = document.querySelector('.header-content');
    const playlistsNav = document.createElement('button');
    playlistsNav.innerHTML = '<i class="fas fa-list"></i> Playlists';
    playlistsNav.style.cssText = `
        background: none;
        border: none;
        color: #ffffff;
        cursor: pointer;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        transition: all 0.3s ease;
        margin-right: 1rem;
    `;
    playlistsNav.addEventListener('click', showPlaylists);
    playlistsNav.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    playlistsNav.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    header.insertBefore(playlistsNav, themeToggle);
});
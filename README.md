
# Minimalist Music App using YouTube API

## Project Structure
```
music-app/
├── src/
│   ├── components/
│   │   ├── Player.js
│   │   ├── SearchBar.js
│   │   ├── MusicList.js
│   │   └── DownloadManager.js
│   ├── styles/
│   │   └── styles.css
│   ├── utils/
│   │   ├── youtubeAPI.js
│   │   └── downloadHandler.js
│   ├── App.js
│   └── index.js
├── public/
│   └── index.html
└── package.json
```

## Implementation Details

### 1. App.js - Main Application Component
```javascript
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import MusicList from './components/MusicList';
import Player from './components/Player';
import DownloadManager from './components/DownloadManager';
import './styles/styles.css';

const App = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);

  return (
    <div className="app-container">
      <SearchBar onSearch={handleSearch} />
      <Player track={currentTrack} />
      <MusicList 
        playlist={playlist} 
        onTrackSelect={setCurrentTrack}
      />
      <DownloadManager track={currentTrack} />
    </div>
  );
};

export default App;
```

### 2. YouTube API Integration (utils/youtubeAPI.js)
```javascript
import axios from 'axios';

const API_KEY = 'AIzaSyCov9Fdbq1T0LS2z5xUClFYnyTdcnGGMUU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchVideos = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 20,
        q: query,
        type: 'video',
        key: API_KEY,
      },
    });
    return response.data.items;
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
};

export const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'contentDetails,snippet',
        id: videoId,
        key: API_KEY,
      },
    });
    return response.data.items[0];
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};
```

### 3. Download Handler (utils/downloadHandler.js)
```javascript
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export const downloadAudio = async (videoUrl, filename) => {
  try {
    await ffmpeg.load();
    
    // Fetch video
    const videoData = await fetchFile(videoUrl);
    ffmpeg.FS('writeFile', 'input.mp4', videoData);
    
    // Convert to MP3
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      'output.mp3'
    );
    
    // Download file
    const data = ffmpeg.FS('readFile', 'output.mp3');
    const blob = new Blob([data.buffer], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.mp3`;
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'output.mp3');
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
};
```

### 4. Player Component (components/Player.js)
```javascript
import React, { useState, useRef, useEffect } from 'react';

const Player = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (track) {
      setIsPlaying(true);
    }
  }, [track]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={track?.audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <div className="progress-bar">
          <div 
            className="progress"
            style={{ width: `${(currentTime / audioRef.current?.duration) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="track-info">
        <h3>{track?.title}</h3>
        <p>{track?.artist}</p>
      </div>
    </div>
  );
};

export default Player;
```

### 5. Minimalist Styling (styles/styles.css)
```css
:root {
  --primary-color: #1a1a1a;
  --secondary-color: #ffffff;
  --accent-color: #1db954;
  --background-color: #121212;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--secondary-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.player {
  background-color: var(--primary-color);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: var(--accent-color);
  transition: width 0.1s linear;
}

button {
  background-color: var(--accent-color);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

button:hover {
  transform: scale(1.1);
}
```

## Features

1. Search YouTube videos
2. Play music with minimal controls
3. Download songs locally (MP3 format)
4. Clean and minimal UI design
5. Progress bar with time tracking
6. Playlist management
7. Responsive design

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@ffmpeg/ffmpeg": "^0.12.0",
    "@ffmpeg/core": "^0.12.0"
  }
}
```

## Setup Instructions

1. Clone the repository
2. Install dependencies using `npm install`
3. Create a YouTube API key from Google Cloud Console
4. Add your API key to `youtubeAPI.js`
5. Run the development server using `npm start`

## Important Notes

1. Ensure compliance with YouTube's terms of service
2. Handle API quota limits appropriately
3. Implement error handling for network issues
4. Consider adding user preferences storage
5. Implement proper loading states
6. Add appropriate error messages for failed operations

## Future Enhancements

1. Add user authentication
2. Implement playlist management
3. Add offline mode support
4. Include equalizer functionality
5. Add cross-platform support
6. Implement theme customization

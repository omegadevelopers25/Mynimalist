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

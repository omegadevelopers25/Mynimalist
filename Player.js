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

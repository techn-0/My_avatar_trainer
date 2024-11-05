// BackgroundMusic.js
import React, { useRef, useState, useEffect } from "react";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MusicOffIcon from "@mui/icons-material/MusicOff";

const BackgroundMusic = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.volume = volume;
    if (isPlaying) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }, [isPlaying, volume]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <audio ref={audioRef} loop src="/sound/namanmu_bgm.mp3" />
      <button onClick={togglePlayPause}>
        {isPlaying ? <MusicNoteIcon /> : <MusicOffIcon />}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(e.target.value)}
        style={{ marginLeft: 10 }}
      />
    </div>
  );
};

export default BackgroundMusic;

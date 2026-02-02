"use client";
import React from "react";
import "./SpotifyWidget.css";

const SpotifyWidget: React.FC = () => {
  return (
    <div className="spotify-widget">
      <h4>Playlist Pública</h4>
      <div className="spotify-placeholder">
        <p>🎵 Widget do Spotify</p>
      </div>
    </div>
  );
};

export default SpotifyWidget;
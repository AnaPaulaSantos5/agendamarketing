import React from 'react';

export default function SpotifyPlayer() {
  return (
    <div className="p-4 bg-gray-100 rounded shadow w-72 flex flex-col gap-2">
      <h3 className="font-semibold">Playlist Pública</h3>
      <div className="bg-gray-300 h-24 rounded flex items-center justify-center text-gray-700">
        Player Visual
      </div>
      <div className="flex gap-2 justify-center mt-2">
        <button className="bg-green-500 text-white px-2 py-1 rounded">Play</button>
        <button className="bg-gray-500 text-white px-2 py-1 rounded">Pause</button>
      </div>
    </div>
  );
}
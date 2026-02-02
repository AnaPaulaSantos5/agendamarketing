import React from 'react';

interface Profile {
  name: string;
  photo: string;
}

const profiles: Profile[] = [
  { name: 'Confi', photo: '/profiles/confi.png' },
  { name: 'Luiza', photo: '/profiles/luiza.png' },
  { name: 'Júlio', photo: '/profiles/julio.png' },
  { name: 'Cecília', photo: '/profiles/cecilia.png' },
];

export default function TopProfiles() {
  return (
    <div className="flex gap-4 p-4 bg-gray-100 border-b">
      {profiles.map((p) => (
        <div key={p.name} className="flex flex-col items-center cursor-pointer">
          <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full border-2 border-yellow-500" />
          <span className="text-sm mt-1">{p.name}</span>
        </div>
      ))}
    </div>
  );
}
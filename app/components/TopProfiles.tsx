import React from 'react';
import { Profile } from '../../types';

interface TopProfilesProps {
  profiles: Profile[];
}

const TopProfiles: React.FC<TopProfilesProps> = ({ profiles }) => {
  return (
    <div className="top-profiles flex gap-4">
      {profiles.map((p, idx) => (
        <div key={idx} className="profile-card text-center">
          <img src={p.photoUrl} alt={p.name} className="w-16 h-16 rounded-full mx-auto" />
          <div>{p.name}</div>
          <small>{p.role}</small>
        </div>
      ))}
    </div>
  );
};

export default TopProfiles;
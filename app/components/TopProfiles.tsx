"use client";
import React from "react";
import "./TopProfiles.css";

interface Profile {
  name: string;
  photoUrl: string;
  phone?: string; // chat id opcional
}

interface TopProfilesProps {
  profiles: Profile[];
  onSelect?: (profile: Profile) => void;
}

const TopProfiles: React.FC<TopProfilesProps> = ({ profiles, onSelect }) => {
  return (
    <div className="top-profiles">
      {profiles.map((profile) => (
        <div
          key={profile.name}
          className="top-profile"
          onClick={() => onSelect && onSelect(profile)}
        >
          <img src={profile.photoUrl} alt={profile.name} />
          <span>{profile.name}</span>
        </div>
      ))}
    </div>
  );
};

export default TopProfiles;
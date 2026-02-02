"use client";
import React from "react";
import "./TopProfiles.css";

const profiles = [
  { name: "Confi", img: "/profiles/confi.png" },
  { name: "Luiza", img: "/profiles/luiza.png" },
  { name: "Júlio", img: "/profiles/julio.png" },
  { name: "Cecília", img: "/profiles/cecilia.png" },
];

const TopProfiles: React.FC = () => {
  return (
    <div className="top-profiles">
      {profiles.map((p) => (
        <div key={p.name} className="profile">
          <img src={p.img} alt={p.name} />
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

export default TopProfiles;
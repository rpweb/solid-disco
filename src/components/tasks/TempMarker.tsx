import React from "react";

interface TempMarkerProps {
  x: number;
  y: number;
}

export const TempMarker: React.FC<TempMarkerProps> = ({ x, y }) => {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <div className="w-8 h-8 rounded-full bg-blue-500 opacity-50 animate-ping" />
      <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-500" />
    </div>
  );
};

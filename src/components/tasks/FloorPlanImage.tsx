import React from "react";

interface FloorPlanImageProps {
  floorPlanImage: string | null;
}

export const FloorPlanImage: React.FC<FloorPlanImageProps> = ({
  floorPlanImage,
}) => {
  if (floorPlanImage) {
    return (
      <img
        src={floorPlanImage}
        alt="Floor Plan"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-gray-400 text-sm">No floor plan image uploaded</p>
    </div>
  );
};

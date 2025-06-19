import React from "react";
import { ZoomControls } from "@/components/tasks/ZoomControls";

interface FloorPlanToolbarProps {
  isAddingTask: boolean;
  toggleAddingMode: () => void;
  zoomLevel: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const FloorPlanToolbar: React.FC<FloorPlanToolbarProps> = ({
  isAddingTask,
  toggleAddingMode,
  zoomLevel,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <div className="flex items-center justify-between mb-4 p-6">
      <h3 className="text-lg font-medium text-gray-900">Floor Plan</h3>
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <ZoomControls
          zoomLevel={zoomLevel}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
        />

        {/* Add task button */}
        <button
          onClick={toggleAddingMode}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            isAddingTask
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isAddingTask ? "Cancel Adding" : "Add Task"}
        </button>
      </div>
    </div>
  );
};

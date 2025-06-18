import React from "react";
import { useUIStore } from "@/stores/uiStore";

interface TaskMarkerProps {
  task: {
    id: string;
    title: string;
    x: number;
    y: number;
    checklist: Array<{ status: string }>;
  };
  isSelected: boolean;
  isHovered?: boolean;
  onClick: () => void;
  disabled?: boolean;
  zoomLevel?: number;
}

export const TaskMarker: React.FC<TaskMarkerProps> = ({
  task,
  isSelected,
  isHovered,
  onClick,
  disabled = false,
  zoomLevel = 1,
}) => {
  const setHoveredTaskId = useUIStore((state) => state.setHoveredTaskId);
  const completedCount = task.checklist.filter(
    (item) => item.status === "done"
  ).length;
  const blockedCount = task.checklist.filter(
    (item) => item.status === "blocked"
  ).length;
  const totalCount = task.checklist.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const hasBlocked = blockedCount > 0;

  // Position tooltip based on marker position
  const tooltipBelow = task.y < 20;
  const tooltipRight = task.x < 15;
  const tooltipLeft = task.x > 85;

  // Calculate pin scale based on zoom level
  // Pins scale slower than the map (square root gives nice scaling curve)
  const pinScale = Math.sqrt(zoomLevel);

  // Additional scale for hover/selected states
  const interactionScale = isSelected ? 1.1 : isHovered ? 1.05 : 1;
  const finalScale = (1 / zoomLevel) * pinScale * interactionScale;

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`absolute transition-all ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      style={{
        left: `${task.x}%`,
        top: `${task.y}%`,
        zIndex: isHovered ? 30 : isSelected ? 20 : 10,
        // Only positioning transform here
        transform: `translate(-50%, -100%)`,
      }}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => !disabled && setHoveredTaskId(task.id)}
      onMouseLeave={() => !disabled && setHoveredTaskId(null)}
      aria-label={`Task: ${task.title}, ${percentage.toFixed(0)}% complete${
        hasBlocked ? ", has blocked items" : ""
      }`}
      aria-pressed={isSelected}
      aria-disabled={disabled}
    >
      <div
        className={`relative group ${isSelected ? "animate-pulse" : ""}`}
        style={{
          // Apply counter-scale only to visual content
          transform: `scale(${finalScale})`,
          transformOrigin: "center bottom", // Scale from bottom since pin points down
        }}
      >
        {/* Task marker pin */}
        <div className="relative">
          {/* Pin shape */}
          <svg
            width="36"
            height="44"
            viewBox="0 0 36 44"
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Pin path with round top and pointed bottom */}
            <path
              d="M18 2C9.16 2 2 9.16 2 18C2 26.84 18 42 18 42S34 26.84 34 18C34 9.16 26.84 2 18 2Z"
              fill={isSelected ? "#3B82F6" : "#FFFFFF"}
              stroke={isSelected ? "#3B82F6" : "#9CA3AF"}
              strokeWidth="2"
            />

            {/* Background circle for progress */}
            <circle
              cx="18"
              cy="18"
              r="12"
              fill={hasBlocked ? "#ef4444" : "#f3f4f6"}
            />

            {/* Progress pie */}
            {percentage > 0 &&
              !hasBlocked &&
              (percentage === 100 ? (
                <circle cx="18" cy="18" r="12" fill="#4ade80" />
              ) : (
                <path
                  d={`M 18 18 L 18 6 A 12 12 0 ${percentage > 50 ? 1 : 0} 1 ${
                    18 + 12 * Math.sin((percentage / 100) * 2 * Math.PI)
                  } ${18 - 12 * Math.cos((percentage / 100) * 2 * Math.PI)} Z`}
                  fill="#4ade80"
                />
              ))}
          </svg>

          {/* Task initial */}
          <div className="absolute inset-0 flex items-start justify-center pt-2">
            <span className="text-sm font-semibold text-gray-800">
              {task.title.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tooltip */}
        <div
          className={`absolute transition-opacity pointer-events-none z-50 ${
            isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } ${
            tooltipRight
              ? "left-full ml-2 top-1/2 -translate-y-1/2"
              : tooltipLeft
              ? "right-full mr-2 top-1/2 -translate-y-1/2"
              : tooltipBelow
              ? "top-full mt-2 left-1/2 -translate-x-1/2"
              : "bottom-full mb-2 left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {task.title}
            <div className="text-[10px] text-gray-300">
              {percentage.toFixed(0)}% complete
            </div>
          </div>
          <div
            className={`absolute ${
              tooltipRight
                ? "right-full -mr-1 top-1/2 -translate-y-1/2"
                : tooltipLeft
                ? "left-full -ml-1 top-1/2 -translate-y-1/2"
                : tooltipBelow
                ? "bottom-full -mb-1 left-1/2 -translate-x-1/2"
                : "top-full -mt-1 left-1/2 -translate-x-1/2"
            }`}
          >
            <div
              className={`border-4 border-transparent ${
                tooltipRight
                  ? "border-r-gray-900"
                  : tooltipLeft
                  ? "border-l-gray-900"
                  : tooltipBelow
                  ? "border-b-gray-900"
                  : "border-t-gray-900"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

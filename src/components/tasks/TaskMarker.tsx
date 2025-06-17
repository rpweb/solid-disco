import React from "react";

interface TaskMarkerProps {
  task: {
    id: string;
    title: string;
    x: number;
    y: number;
    checklist: Array<{ status: string }>;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const TaskMarker: React.FC<TaskMarkerProps> = ({
  task,
  isSelected,
  onClick,
}) => {
  const completedCount = task.checklist.filter(
    (item) => item.status === "done"
  ).length;
  const totalCount = task.checklist.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
        isSelected ? "scale-110 z-20" : "hover:scale-105 z-10"
      }`}
      style={{ left: `${task.x}%`, top: `${task.y}%` }}
      onClick={onClick}
    >
      <div className={`relative group ${isSelected ? "animate-pulse" : ""}`}>
        {/* Task marker */}
        <div
          className={`w-8 h-8 rounded-full border-2 ${
            isSelected
              ? "border-blue-500 bg-blue-100"
              : "border-gray-400 bg-white"
          } shadow-lg flex items-center justify-center`}
        >
          <span className="text-xs font-semibold">
            {task.title.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center">
          <span className="text-[10px] font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {task.title}
            <div className="text-[10px] text-gray-300">
              {percentage.toFixed(0)}% complete
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

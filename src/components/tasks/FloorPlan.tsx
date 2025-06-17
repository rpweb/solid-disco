import React, { useRef, useState } from "react";
import { useTaskStore } from "@/stores/taskStore";
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
  onClick: () => void;
}

const TaskMarker: React.FC<TaskMarkerProps> = ({
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

export const FloorPlan: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ x: number; y: number } | null>(
    null
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { tasks, createTask } = useTaskStore();
  const { selectedTaskId, setSelectedTaskId, floorPlanImage } = useUIStore();

  const handleFloorPlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingTask || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Round to 2 decimal places to ensure multipleOf 0.01
    // Using parseFloat to avoid floating point precision issues
    setTempMarker({
      x: parseFloat((Math.round(x * 100) / 100).toFixed(2)),
      y: parseFloat((Math.round(y * 100) / 100).toFixed(2)),
    });
    setShowTaskModal(true);
  };

  const handleCreateTask = async () => {
    if (!tempMarker || !newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle.trim(),
      x: tempMarker.x,
      y: tempMarker.y,
    });

    // Reset state
    setNewTaskTitle("");
    setTempMarker(null);
    setShowTaskModal(false);
    setIsAddingTask(false);
  };

  const handleCancelTask = () => {
    setNewTaskTitle("");
    setTempMarker(null);
    setShowTaskModal(false);
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Floor Plan</h3>
        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isAddingTask
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isAddingTask ? "Cancel Adding" : "Add Task"}
        </button>
      </div>

      {/* Floor plan container */}
      <div
        ref={containerRef}
        className={`relative bg-gray-100 rounded-lg overflow-hidden shadow-inner ${
          isAddingTask ? "cursor-crosshair" : "cursor-default"
        }`}
        style={{ paddingBottom: "60%" }} // Maintain aspect ratio
        onClick={handleFloorPlanClick}
      >
        {/* Floor plan image */}
        {floorPlanImage ? (
          <img
            src={floorPlanImage}
            alt="Floor Plan"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-400 text-sm">
              No floor plan image uploaded
            </p>
          </div>
        )}

        {/* Task markers */}
        {tasks.map((task) => (
          <TaskMarker
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onClick={() => setSelectedTaskId(task.id)}
          />
        ))}

        {/* Temporary marker while adding */}
        {tempMarker && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${tempMarker.x}%`, top: `${tempMarker.y}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 opacity-50 animate-ping"></div>
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-500"></div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {isAddingTask && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            Click anywhere on the floor plan to place a new task
          </p>
        </div>
      )}

      {/* New Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Task</h3>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleCancelTask}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

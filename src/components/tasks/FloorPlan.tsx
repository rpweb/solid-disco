import React from "react";
import { useFloorPlan } from "@/hooks/useFloorPlan";
import { TaskMarker } from "./TaskMarker";
import { NewTaskModal } from "./NewTaskModal";

export const FloorPlan: React.FC = () => {
  const {
    containerRef,
    isAddingTask,
    tempMarker,
    newTaskTitle,
    setNewTaskTitle,
    showTaskModal,
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    floorPlanImage,
    handleFloorPlanClick,
    handleCreateTask,
    handleCancelTask,
    toggleAddingMode,
  } = useFloorPlan();

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Floor Plan</h3>
        <button
          onClick={toggleAddingMode}
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
        className={`relative bg-gray-100 rounded-lg shadow-inner ${
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
        <NewTaskModal
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          onCancel={handleCancelTask}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

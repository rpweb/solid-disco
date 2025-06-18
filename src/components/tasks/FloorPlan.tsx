import React from "react";
import { useFloorPlan } from "@/hooks/useFloorPlan";
import { useZoom } from "@/hooks/useZoom";
import { TaskMarker } from "./TaskMarker";
import { NewTaskModal } from "./NewTaskModal";
import { ZoomControls } from "./ZoomControls";

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
    hoveredTaskId,
    floorPlanImage,
    handleFloorPlanClick,
    handleCreateTask,
    handleCancelTask,
    toggleAddingMode,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useFloorPlan();

  // Zoom functionality
  const {
    zoomLevel,
    setZoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    minZoom,
    maxZoom,
  } = useZoom({ zoomStep: 0.5 });

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-6">
        <h3 className="text-lg font-medium text-gray-900">Floor Plan</h3>
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <ZoomControls
            zoomLevel={zoomLevel}
            minZoom={minZoom}
            maxZoom={maxZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
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

      {/* Floor plan container with dynamic height */}
      <div
        className={`relative bg-gray-100 shadow-inner overflow-auto min-h-[400px] ${
          isAddingTask ? "cursor-crosshair" : "cursor-default"
        }`}
      >
        {/* Wrapper to accommodate scaled content */}
        <div
          className={`
            flex items-start justify-center p-5 box-border
            ${zoomLevel === 1 ? "w-full min-w-full xl:max-w-full" : ""}
          `}
          style={{
            // Dynamic values that can't be expressed in Tailwind
            ...(zoomLevel === 1
              ? { width: "max(100%, 1040px)" }
              : {
                  width: `${700 * zoomLevel + 40}px`,
                  height: `${420 * zoomLevel + 40}px`,
                }),
          }}
        >
          {/* Inner scrollable container with zoom */}
          <div
            ref={containerRef}
            className={`
              relative touch-none aspect-[5/3]
              ${
                zoomLevel === 1
                  ? "w-full h-auto min-w-[1000px] xl:min-w-0 min-h-[600px] xl:min-h-0 max-w-full"
                  : "w-[700px] h-[420px] min-w-[700px]"
              }
            `}
            style={{
              // Only dynamic transform values
              transform: zoomLevel === 1 ? "none" : `scale(${zoomLevel})`,
              transformOrigin: "center top",
            }}
            onClick={handleFloorPlanClick}
            onTouchStart={handleTouchStart}
            onTouchMove={(e) =>
              handleTouchMove(e, (scale: number) => {
                setZoomLevel((prev) => {
                  const newZoom = prev * scale;
                  return Math.max(minZoom, Math.min(maxZoom, newZoom));
                });
              })
            }
            onTouchEnd={handleTouchEnd}
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
                isHovered={hoveredTaskId === task.id}
                onClick={() => !isAddingTask && setSelectedTaskId(task.id)}
                disabled={isAddingTask}
                zoomLevel={zoomLevel}
              />
            ))}

            {/* Temporary marker while adding */}
            {tempMarker && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${tempMarker.x}%`,
                  top: `${tempMarker.y}%`,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 opacity-50 animate-ping" />
                <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-500" />
              </div>
            )}
          </div>
        </div>
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

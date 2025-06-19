import React from "react";
import { useFloorPlan } from "@/hooks/useFloorPlan";
import { useZoom } from "@/hooks/useZoom";
import { TaskMarker } from "@/components/tasks/TaskMarker";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { FloorPlanToolbar } from "@/components/tasks/FloorPlanToolbar";
import { FloorPlanImage } from "@/components/tasks/FloorPlanImage";
import { TempMarker } from "@/components/tasks/TempMarker";

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
  } = useFloorPlan();

  const {
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    minZoom,
    maxZoom,
  } = useZoom({ zoomStep: 0.5 });

  return (
    <div className="relative">
      {/* Toolbar */}
      <FloorPlanToolbar
        isAddingTask={isAddingTask}
        toggleAddingMode={toggleAddingMode}
        zoomLevel={zoomLevel}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

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
              relative aspect-[5/3] origin-top select-none
              ${
                zoomLevel === 1
                  ? "w-full h-auto min-w-[1000px] xl:min-w-0 min-h-[600px] xl:min-h-0 max-w-full"
                  : "w-[700px] h-[420px] min-w-[700px]"
              }
            `}
            style={{
              transform: zoomLevel === 1 ? "none" : `scale(${zoomLevel})`,
            }}
            onClick={handleFloorPlanClick}
          >
            {/* Floor plan image */}
            <FloorPlanImage floorPlanImage={floorPlanImage} />

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
            {tempMarker && <TempMarker x={tempMarker.x} y={tempMarker.y} />}
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

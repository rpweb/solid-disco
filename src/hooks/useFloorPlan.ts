import { useRef, useState, useCallback } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";

export const useFloorPlan = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ x: number; y: number } | null>(
    null
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Touch handling for pinch zoom
  const touchStartDistance = useRef<number | null>(null);

  const { tasks, createTask } = useTaskStore();
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId);
  const hoveredTaskId = useUIStore((state) => state.hoveredTaskId);
  const floorPlanImage = useUIStore((state) => state.floorPlanImage);

  const handleFloorPlanClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isAddingTask || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Round to 2 decimal places for display purposes
      setTempMarker({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
      });
      setShowTaskModal(true);
    },
    [isAddingTask]
  );

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

  const toggleAddingMode = () => {
    setIsAddingTask(!isAddingTask);
    if (isAddingTask) {
      // If canceling, clean up
      handleCancelTask();
    }
  };

  // Calculate touch distance for pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartDistance.current = getTouchDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent, onZoom: (scale: number) => void) => {
      if (e.touches.length === 2 && touchStartDistance.current) {
        const currentDistance = getTouchDistance(e.touches);
        if (currentDistance) {
          const scale = currentDistance / touchStartDistance.current;
          onZoom(scale);
          touchStartDistance.current = currentDistance;
        }
      }
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    touchStartDistance.current = null;
  }, []);

  return {
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
  };
};

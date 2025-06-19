import { useRef, useState, useCallback, useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import {
  setupTouchListeners,
  type MinimalTouchEvent,
} from "@/utils/touch.utils";

export const useFloorPlan = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ x: number; y: number } | null>(
    null
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);

  const touchStartPosition = useRef<{ x: number; y: number } | null>(null);
  const touchMoved = useRef(false);

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
      handleCancelTask();
    }
  };

  const handleTouchStart = useCallback(
    (e: MinimalTouchEvent) => {
      touchMoved.current = false;

      if (e.touches.length === 1 && isAddingTask) {
        // Store touch start position for tap detection
        const touch = e.touches[0];
        touchStartPosition.current = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }
    },
    [isAddingTask]
  );

  const handleTouchMove = useCallback(() => {
    if (touchStartPosition.current) {
      // Mark as moved to prevent tap action
      touchMoved.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: MinimalTouchEvent) => {
      // Handle tap for adding task
      if (
        isAddingTask &&
        !touchMoved.current &&
        touchStartPosition.current &&
        e.changedTouches.length === 1 &&
        containerRef.current
      ) {
        const touch = e.changedTouches[0];
        const startPos = touchStartPosition.current;

        // Check if touch end is close to start (within 10 pixels)
        const dx = touch.clientX - startPos.x;
        const dy = touch.clientY - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 10) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = ((touch.clientX - rect.left) / rect.width) * 100;
          const y = ((touch.clientY - rect.top) / rect.height) * 100;

          // Round to 2 decimal places for display purposes
          setTempMarker({
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
          });
          setShowTaskModal(true);
        }
      }

      touchStartPosition.current = null;
      touchMoved.current = false;
    },
    [isAddingTask]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    return setupTouchListeners(container, {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

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
  };
};

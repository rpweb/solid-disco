import { useRef, useState } from "react";
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

  const toggleAddingMode = () => {
    setIsAddingTask(!isAddingTask);
    if (isAddingTask) {
      // Reset state when canceling add mode
      setTempMarker(null);
      setShowTaskModal(false);
      setNewTaskTitle("");
    }
  };

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
    floorPlanImage,
    handleFloorPlanClick,
    handleCreateTask,
    handleCancelTask,
    toggleAddingMode,
  };
};

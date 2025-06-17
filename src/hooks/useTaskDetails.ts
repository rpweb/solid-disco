import { useState, useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import type { ChecklistItemType } from "@/types/db.types";

export const useTaskDetails = () => {
  const { tasks, updateTask, updateChecklistItem } = useTaskStore();
  const { selectedTaskId, setSelectedTaskId } = useUIStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  useEffect(() => {
    if (selectedTask) {
      setNewTitle(selectedTask.title);
    }
  }, [selectedTask]);

  const handleClose = () => {
    setSelectedTaskId(null);
    setEditingTitle(false);
  };

  const handleUpdateTitle = async () => {
    if (!selectedTask) return;
    if (newTitle.trim() && newTitle !== selectedTask.title) {
      await updateTask(selectedTask.id, { title: newTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleAddItem = async () => {
    if (!selectedTask || !newItemText.trim()) return;

    const newItem: ChecklistItemType = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      status: "not-started",
    };

    await updateTask(selectedTask.id, {
      checklist: [...selectedTask.checklist, newItem],
    });

    setNewItemText("");
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedTask) return;

    const updatedChecklist = selectedTask.checklist.filter(
      (item) => item.id !== itemId
    );
    await updateTask(selectedTask.id, { checklist: updatedChecklist });
  };

  const handleUpdateChecklistItem = async (
    itemId: string,
    updates: Partial<ChecklistItemType>
  ) => {
    if (!selectedTask) return;
    await updateChecklistItem(selectedTask.id, itemId, updates);
  };

  const hasBlockedItems =
    selectedTask?.checklist.some((item) => item.status === "blocked") ?? false;

  return {
    selectedTask,
    editingTitle,
    setEditingTitle,
    newTitle,
    setNewTitle,
    newItemText,
    setNewItemText,
    isExpanded,
    setIsExpanded,
    hasBlockedItems,
    handleClose,
    handleUpdateTitle,
    handleAddItem,
    handleDeleteItem,
    handleUpdateChecklistItem,
  };
};

import React, { useState, useEffect } from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import type { ChecklistItem } from "@/types/db.types";

const statusConfig = {
  "not-started": {
    icon: "○",
    color: "text-gray-400",
    bgColor: "bg-gray-100",
    label: "Not started",
  },
  "in-progress": {
    icon: "◐",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    label: "In Progress",
  },
  blocked: {
    icon: "⚠",
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Blocked",
  },
  "final-check": {
    icon: "◔",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Final Check awaiting",
  },
  done: {
    icon: "✓",
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Done",
  },
};

const ChecklistItemComponent: React.FC<{
  item: ChecklistItem;
  onStatusChange: (status: string) => void;
  onTextChange: (text: string) => void;
  onDelete: () => void;
}> = ({ item, onStatusChange, onTextChange, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const status = statusConfig[item.status];

  const handleTextSubmit = () => {
    if (editText.trim()) {
      onTextChange(editText.trim());
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative">
      <div className="flex items-start space-x-3 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2">
        {/* Status Icon/Button */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
              item.status === "done"
                ? "bg-green-100 text-green-600 border-2 border-green-600"
                : item.status === "blocked"
                ? "bg-red-100 text-red-600 border-2 border-red-600"
                : item.status === "final-check"
                ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                : item.status === "in-progress"
                ? "bg-yellow-100 text-yellow-600 border-2 border-yellow-600"
                : "bg-white border-2 border-gray-300"
            }`}
          >
            {status.icon}
          </button>

          {/* Status Dropdown */}
          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[200px]">
              {Object.entries(statusConfig).map(([value, config]) => (
                <button
                  key={value}
                  onClick={() => {
                    onStatusChange(value);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                    item.status === value ? "bg-gray-50" : ""
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center ${config.bgColor} ${config.color}`}
                  >
                    {config.icon}
                  </span>
                  <span className="text-gray-700">{config.label}</span>
                  {item.status === value && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Task Text */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleTextSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTextSubmit();
                if (e.key === "Escape") {
                  setEditText(item.text);
                  setIsEditing(false);
                }
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div onClick={() => setIsEditing(true)} className="cursor-text">
              <p
                className={`text-sm ${
                  item.status === "done"
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {item.text}
              </p>
              {item.status !== "not-started" && (
                <p className={`text-xs mt-0.5 ${status.color}`}>
                  {status.label}
                  {item.status === "blocked" && ": Part installation done"}
                  {item.status === "done" && ": Part installation done"}
                  {item.status === "final-check" && " done"}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {showStatusMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowStatusMenu(false)}
        />
      )}
    </div>
  );
};

export const TaskDetails: React.FC = () => {
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

  if (!selectedTask) return null;

  const handleClose = () => {
    setSelectedTaskId(null);
    setEditingTitle(false);
  };

  const handleUpdateTitle = async () => {
    if (newTitle.trim() && newTitle !== selectedTask.title) {
      await updateTask(selectedTask.id, { title: newTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
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
    const updatedChecklist = selectedTask.checklist.filter(
      (item) => item.id !== itemId
    );
    await updateTask(selectedTask.id, { checklist: updatedChecklist });
  };

  const hasBlockedItems = selectedTask.checklist.some(
    (item) => item.status === "blocked"
  );

  return (
    <div className="fixed inset-0 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Task Name Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Task Name</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {hasBlockedItems && (
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              )}
              {editingTitle ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                  className="flex-1 text-base px-2 py-1 border border-gray-300 rounded"
                  autoFocus
                />
              ) : (
                <p
                  className={`text-base cursor-pointer hover:text-gray-700 ${
                    hasBlockedItems ? "text-red-600" : "text-gray-900"
                  }`}
                  onClick={() => setEditingTitle(true)}
                >
                  {hasBlockedItems && "Ticket progress is blocked"}
                  {!hasBlockedItems && selectedTask.title}
                </p>
              )}
            </div>
          </div>

          {/* Checklist Section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Checklist</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedTask.checklist.length} STEPS
                </span>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {isExpanded && (
              <>
                {/* Checklist Items */}
                <div className="space-y-1">
                  {selectedTask.checklist.map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onStatusChange={(status) =>
                        updateChecklistItem(selectedTask.id, item.id, {
                          status: status as any,
                        })
                      }
                      onTextChange={(text) =>
                        updateChecklistItem(selectedTask.id, item.id, { text })
                      }
                      onDelete={() => handleDeleteItem(item.id)}
                    />
                  ))}
                </div>

                {/* Add New Item */}
                <button
                  onClick={() => {
                    const input = document.getElementById("new-item-input");
                    if (input) {
                      input.focus();
                    }
                  }}
                  className="mt-4 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      +
                    </span>
                    <span className="text-sm font-medium">ADD NEW ITEM</span>
                  </div>
                </button>

                {/* Hidden input for adding new items */}
                <input
                  id="new-item-input"
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem();
                    if (e.key === "Escape") setNewItemText("");
                  }}
                  onBlur={() => {
                    if (newItemText.trim()) handleAddItem();
                  }}
                  placeholder="Type new item and press Enter..."
                  className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
                  style={{ display: newItemText ? "block" : "none" }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

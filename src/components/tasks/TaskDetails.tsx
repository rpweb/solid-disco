import React from "react";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { ChecklistItem } from "./ChecklistItem";

export const TaskDetails: React.FC = () => {
  const {
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
  } = useTaskDetails();

  if (!selectedTask) return null;

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
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      onStatusChange={(status) =>
                        handleUpdateChecklistItem(item.id, {
                          status: status as any,
                        })
                      }
                      onTextChange={(text) =>
                        handleUpdateChecklistItem(item.id, { text })
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

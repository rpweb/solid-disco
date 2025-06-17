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
    showNewItemInput,
    newItemInputRef,
    handleClose,
    handleUpdateTitle,
    handleAddItem,
    handleShowNewItemInput,
    handleCancelNewItem,
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
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                aria-label="Close task details"
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
                  role="button"
                  tabIndex={0}
                  className={`text-base cursor-pointer`}
                  onClick={() => setEditingTitle(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditingTitle(true);
                    }
                  }}
                >
                  {selectedTask.title}
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
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                  aria-label={
                    isExpanded ? "Collapse checklist" : "Expand checklist"
                  }
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
                {!showNewItemInput ? (
                  <button
                    onClick={handleShowNewItemInput}
                    className="mt-4 w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <span className="text-2xl group-hover:scale-110 transition-transform">
                        +
                      </span>
                      <span className="text-sm font-medium">ADD NEW ITEM</span>
                    </div>
                  </button>
                ) : (
                  <input
                    ref={newItemInputRef}
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newItemText.trim()) {
                        handleAddItem();
                      }
                      if (e.key === "Escape") {
                        handleCancelNewItem();
                      }
                    }}
                    onBlur={() => {
                      if (!newItemText.trim()) {
                        handleCancelNewItem();
                      }
                    }}
                    placeholder="Type new item and press Enter..."
                    className="mt-4 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import type { ChecklistItemType } from "@/types/db.types";
import { statusConfig } from "@/utils/constants";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onStatusChange: (status: string) => void;
  onTextChange: (text: string) => void;
  onDelete: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  onStatusChange,
  onTextChange,
  onDelete,
}) => {
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

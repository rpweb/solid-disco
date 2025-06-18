import React, { useState } from "react";
import type { ChecklistItemType } from "@/types/db.types";
import { CHECKLIST_STATUS, type ChecklistItemStatus } from "@/types/db.types";
import { getStatusConfig, getStatusFullClasses } from "@/utils/status.utils";
import { DeleteButton } from "@/components/ui/DeleteButton";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onStatusChange: (status: ChecklistItemStatus) => void;
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

  const statusConfig = getStatusConfig(item.status);
  const statusClasses = getStatusFullClasses(item.status);

  const handleTextSubmit = () => {
    if (editText.trim() && editText !== item.text) {
      onTextChange(editText.trim());
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg group">
      {/* Status Button/Checkbox */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all cursor-pointer ${
            item.status === "not-started"
              ? "bg-white border-2 border-gray-300"
              : statusClasses
          }`}
          aria-label={`Change status. Current status: ${statusConfig.label}`}
          aria-expanded={showStatusMenu}
          aria-haspopup="true"
        >
          {statusConfig.icon}
        </button>

        {/* Status Dropdown Menu */}
        {showStatusMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[200px]">
            {Object.values(CHECKLIST_STATUS).map((value) => {
              const config = getStatusConfig(value);
              return (
                <button
                  key={value}
                  onClick={() => {
                    onStatusChange(value);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 cursor-pointer ${config.bgClass} ${config.textClass}`}
                  aria-label={`Set status to ${config.label}`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              );
            })}
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
              if (e.key === "Enter") {
                handleTextSubmit();
              } else if (e.key === "Escape") {
                setEditText(item.text);
                setIsEditing(false);
              }
            }}
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
            autoFocus
          />
        ) : (
          <div>
            <p
              role="button"
              tabIndex={0}
              className={`text-sm cursor-pointer ${
                item.status === "done" ? "line-through text-gray-500" : ""
              }`}
              onClick={() => setIsEditing(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsEditing(true);
                }
              }}
            >
              {item.text}
            </p>
            {item.status !== "not-started" && (
              <p className={`text-xs mt-0.5 ${statusConfig.textClass}`}>
                {statusConfig.label}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete Button with Confirmation */}
      <DeleteButton
        onDelete={onDelete}
        itemName={item.text}
        confirmMessage="Delete this item?"
        className="ml-4 text-red-600 hover:text-red-800 cursor-pointer p-1"
      />
    </div>
  );
};

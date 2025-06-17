import React, { useState } from "react";
import { DeleteConfirmation } from "./DeleteConfirmation";

interface DeleteButtonProps {
  onDelete: () => void;
  itemName: string;
  className?: string;
  iconClassName?: string;
  confirmMessage?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onDelete,
  itemName,
  className = "opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity cursor-pointer p-1",
  iconClassName = "w-4 h-4",
  confirmMessage,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onDelete();
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className={className}
        aria-label={`Delete ${itemName}`}
      >
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
      <DeleteConfirmation
        isOpen={showConfirm}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
        message={confirmMessage || `Delete ${itemName}?`}
      />
    </div>
  );
};

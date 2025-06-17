import React, { useRef, useEffect } from "react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message = "Delete this item?",
}) => {
  const confirmRef = useRef<HTMLDivElement>(null);

  // Close confirmation dialog on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        confirmRef.current &&
        !confirmRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      ref={confirmRef}
      className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 min-w-[160px]"
    >
      <p className="text-sm text-gray-700 mb-2">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
          aria-label="Confirm delete"
        >
          Yes
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
          aria-label="Cancel delete"
        >
          No
        </button>
      </div>
    </div>
  );
};

import React from "react";
import { Modal } from "@/components/ui/Modal";

interface NewTaskModalProps {
  newTaskTitle: string;
  setNewTaskTitle: (title: string) => void;
  onCancel: () => void;
  onCreate: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  newTaskTitle,
  setNewTaskTitle,
  onCancel,
  onCreate,
}) => {
  return (
    <Modal isOpen onClose={onCancel} closeOnBackdrop={false}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">New Task</h3>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onCreate()}
        />
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!newTaskTitle.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Create Task
          </button>
        </div>
      </div>
    </Modal>
  );
};

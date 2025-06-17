import React from "react";
import { useTaskStore } from "../../stores/taskStore";
import { useUIStore } from "../../stores/uiStore";

export const TaskList: React.FC = () => {
  const { tasks, deleteTask } = useTaskStore();
  const { selectedTaskId, setSelectedTaskId } = useUIStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "final-check":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Tasks ({tasks.length})
        </h3>
      </div>

      {tasks.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">
            No tasks yet. Click "Add Task" on the floor plan to create one.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {tasks.map((task) => {
            const completedCount = task.checklist.filter(
              (item) => item.status === "done"
            ).length;
            const totalCount = task.checklist.length;
            const percentage =
              totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <div
                key={task.id}
                className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedTaskId === task.id ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Position: ({task.x.toFixed(1)}%, {task.y.toFixed(1)}%)
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {completedCount} of {totalCount} completed
                        </span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Checklist preview */}
                    <div className="mt-2 space-y-1">
                      {task.checklist.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-2"
                        >
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {item.text}
                          </span>
                        </div>
                      ))}
                      {task.checklist.length > 2 && (
                        <p className="text-xs text-gray-400">
                          +{task.checklist.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this task?")) {
                        deleteTask(task.id);
                      }
                    }}
                    className="ml-4 text-red-600 hover:text-red-800"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";
import { getStatusBadgeClasses, getStatusLabel } from "@/utils/status.utils";
import { DeleteButton } from "@/components/ui/DeleteButton";

export const TaskList: React.FC = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const selectedTaskId = useUIStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useUIStore((state) => state.setSelectedTaskId);
  const setHoveredTaskId = useUIStore((state) => state.setHoveredTaskId);

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
                className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedTaskId === task.id ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setHoveredTaskId(task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
              >
                <div className="flex items-start justify-between">
                  <button
                    className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-pointer"
                    onClick={() => setSelectedTaskId(task.id)}
                    aria-label={`Select task: ${task.title}`}
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h4>

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
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClasses(
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
                  </button>

                  <DeleteButton
                    onDelete={() => deleteTask(task.id)}
                    itemName={task.title}
                    confirmMessage={`Delete task "${task.title}"?`}
                    className="ml-4 text-red-600 hover:text-red-800 cursor-pointer p-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

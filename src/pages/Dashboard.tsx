import React, { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useTaskStore } from "../stores/taskStore";

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { tasks, initializeTasks, cleanup } = useTaskStore();

  useEffect(() => {
    if (currentUser) {
      initializeTasks(currentUser.id);
    }

    return () => {
      cleanup();
    };
  }, [currentUser?.id]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your construction tasks on the floor plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Floor Plan will go here */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Floor Plan</h3>
          <div className="bg-gray-100 rounded h-96 flex items-center justify-center">
            <p className="text-gray-500">Floor plan component coming soon...</p>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tasks ({tasks.length})
          </h3>
          {tasks.length === 0 ? (
            <p className="text-gray-500">
              No tasks yet. Click on the floor plan to add tasks.
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Position: ({task.x}, {task.y})
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {
                        task.checklist.filter((item) => item.status === "done")
                          .length
                      }{" "}
                      / {task.checklist.length} completed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

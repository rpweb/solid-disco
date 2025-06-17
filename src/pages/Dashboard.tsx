import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useTaskStore } from "@/stores/taskStore";
import { FloorPlan } from "@/components/tasks/FloorPlan";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskDetails } from "@/components/tasks/TaskDetails";

export const Dashboard: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const initializeTasks = useTaskStore((state) => state.initializeTasks);
  const cleanup = useTaskStore((state) => state.cleanup);

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Floor Plan */}
        <div className="bg-white rounded-lg shadow p-6 xl:col-span-2">
          <FloorPlan />
        </div>

        {/* Task List */}
        <div>
          <TaskList />
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetails />
    </div>
  );
};

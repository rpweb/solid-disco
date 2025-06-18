import { create } from "zustand";
import { getDatabase } from "@/db/database";
import type { ChecklistItemType, RxTaskDocumentType } from "@/types/db.types";
import { generateDefaultChecklist } from "@/utils/constants";
import { Subscription } from "rxjs";
import { useAuthStore } from "@/stores/authStore";

export interface TaskState {
  tasks: RxTaskDocumentType[];
  isLoading: boolean;
  error: string | null;
  subscription: Subscription | null;

  // Actions
  initializeTasks: (userId: string) => Promise<void>;
  createTask: (data: { title: string; x: number; y: number }) => Promise<void>;
  updateTask: (
    id: string,
    updates: Partial<RxTaskDocumentType>
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateChecklistItem: (
    taskId: string,
    itemId: string,
    updates: Partial<ChecklistItemType>
  ) => Promise<void>;
  cleanup: () => void;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  subscription: null,

  initializeTasks: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const db = await getDatabase();

      // Clean up previous subscription
      const { subscription } = get();
      if (subscription) {
        subscription.unsubscribe();
      }

      // Query tasks for current user
      const query = db.tasks.find({
        selector: {
          userId,
        },
        sort: [{ createdAt: "desc" }],
      });

      // Initial load
      const docs = await query.exec();
      set({
        tasks: docs.map((doc) => ({
          ...doc.toJSON(),
          checklist: [...doc.toJSON().checklist],
        })),
      });

      // Subscribe to changes
      const newSubscription = query.$.subscribe((results) => {
        set({
          tasks: results.map((doc) => ({
            ...doc.toJSON(),
            checklist: [...doc.toJSON().checklist],
          })),
        });
      });

      set({ subscription: newSubscription, isLoading: false });
    } catch (error) {
      // Retry once if we get DB9 error (database already exists)
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "DB9"
      ) {
        setTimeout(() => get().initializeTasks(userId), 100);
        return;
      }
      console.error("Error initializing tasks:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load tasks",
      });
    }
  },

  createTask: async ({ title, x, y }) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) {
      set({ error: "User not logged in" });
      return;
    }

    try {
      const db = await getDatabase();

      // Ensure tasks collection is ready
      if (!db.tasks) {
        console.log("Tasks collection not ready, waiting...");
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const now = Date.now();

      await db.tasks.insert({
        id: crypto.randomUUID(),
        userId,
        title,
        x: parseFloat((Math.round(x * 100) / 100).toFixed(2)),
        y: parseFloat((Math.round(y * 100) / 100).toFixed(2)),
        checklist: generateDefaultChecklist(),
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to create task",
      });
    }
  },

  updateTask: async (id: string, updates: Partial<RxTaskDocumentType>) => {
    try {
      const db = await getDatabase();
      const task = await db.tasks.findOne(id).exec();

      if (task) {
        // Round x and y if they're being updated
        const processedUpdates = { ...updates };
        if (typeof updates.x === "number") {
          processedUpdates.x = parseFloat(
            (Math.round(updates.x * 100) / 100).toFixed(2)
          );
        }
        if (typeof updates.y === "number") {
          processedUpdates.y = parseFloat(
            (Math.round(updates.y * 100) / 100).toFixed(2)
          );
        }

        await task.patch({
          ...processedUpdates,
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to update task",
      });
    }
  },

  deleteTask: async (id: string) => {
    try {
      const db = await getDatabase();
      const task = await db.tasks.findOne(id).exec();

      if (task) {
        await task.remove();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to delete task",
      });
    }
  },

  updateChecklistItem: async (
    taskId: string,
    itemId: string,
    updates: Partial<ChecklistItemType>
  ) => {
    try {
      const db = await getDatabase();
      const task = await db.tasks.findOne(taskId).exec();

      if (task) {
        const checklist = task.checklist.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        );

        await task.patch({
          checklist,
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error updating checklist item:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update checklist",
      });
    }
  },

  cleanup: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
    }
    set({ tasks: [], subscription: null, error: null });
  },
}));

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getDatabase } from "@/db/database";
import type { ChecklistItem, RxTaskDocumentType } from "@/types/db.types";
import { generateDefaultChecklist } from "@/utils/constants";
import { Subscription } from "rxjs";
import { useAuthStore } from "@/stores/authStore";

interface TaskState {
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
    updates: Partial<ChecklistItem>
  ) => Promise<void>;
  cleanup: () => void;
}

export const useTaskStore = create<TaskState>()(
  subscribeWithSelector((set, get) => ({
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
        console.error("Error initializing tasks:", error);
        set({
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load tasks",
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
        const now = Date.now();

        await db.tasks.insert({
          id: crypto.randomUUID(),
          userId,
          title,
          x,
          y,
          checklist: generateDefaultChecklist(),
          createdAt: now,
          updatedAt: now,
        });
      } catch (error) {
        console.error("Error creating task:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to create task",
        });
      }
    },

    updateTask: async (id: string, updates: Partial<RxTaskDocumentType>) => {
      try {
        const db = await getDatabase();
        const task = await db.tasks.findOne(id).exec();

        if (task) {
          await task.patch({
            ...updates,
            updatedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error("Error updating task:", error);
        set({
          error:
            error instanceof Error ? error.message : "Failed to update task",
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
          error:
            error instanceof Error ? error.message : "Failed to delete task",
        });
      }
    },

    updateChecklistItem: async (
      taskId: string,
      itemId: string,
      updates: Partial<ChecklistItem>
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
            error instanceof Error
              ? error.message
              : "Failed to update checklist",
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
  }))
);

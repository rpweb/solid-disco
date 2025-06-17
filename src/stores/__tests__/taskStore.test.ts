import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTaskStore } from "../taskStore";
import { getDatabase } from "@/db/database";
import { useAuthStore } from "@/stores/authStore";
import type { Subscription } from "rxjs";

// Mock dependencies
vi.mock("@/db/database");
vi.mock("@/stores/authStore");

describe("taskStore", () => {
  const mockTasks = [
    {
      id: "1",
      userId: "user1",
      title: "Task 1",
      x: 25,
      y: 30,
      checklist: [{ id: "c1", text: "Item 1", status: "not-started" }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "2",
      userId: "user1",
      title: "Task 2",
      x: 75,
      y: 60,
      checklist: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mockSubscription: Subscription = {
    unsubscribe: vi.fn(),
  } as any;

  const mockQuery = {
    exec: vi.fn().mockResolvedValue(
      mockTasks.map((task) => ({
        toJSON: () => task,
      }))
    ),
    $: {
      subscribe: vi.fn((callback) => {
        // Immediately call with initial data
        callback(
          mockTasks.map((task) => ({
            toJSON: () => task,
          }))
        );
        return mockSubscription;
      }),
    },
  };

  const mockTaskDoc = {
    patch: vi.fn(),
    remove: vi.fn(),
    checklist: mockTasks[0].checklist,
  };

  const mockDb = {
    tasks: {
      find: vi.fn().mockReturnValue(mockQuery),
      findOne: vi.fn((id) => ({
        exec: vi.fn().mockResolvedValue(id === "1" ? mockTaskDoc : null),
      })),
      insert: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDatabase).mockResolvedValue(mockDb as any);
    // Mock the static getState method on useAuthStore
    (useAuthStore as any).getState = vi.fn(() => ({
      currentUser: { id: "user1" },
    }));
  });

  afterEach(() => {
    // Clean up store state
    act(() => {
      useTaskStore.getState().cleanup();
    });
  });

  describe("initializeTasks", () => {
    it("loads tasks for the given user", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.initializeTasks("user1");
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].title).toBe("Task 1");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("cleans up previous subscription before creating new one", async () => {
      const { result } = renderHook(() => useTaskStore());

      // First initialization
      await act(async () => {
        await result.current.initializeTasks("user1");
      });

      // Second initialization
      await act(async () => {
        await result.current.initializeTasks("user2");
      });

      expect(mockSubscription.unsubscribe).toHaveBeenCalledOnce();
    });

    it("handles database errors", async () => {
      vi.mocked(getDatabase).mockRejectedValueOnce(new Error("DB Error"));

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.initializeTasks("user1");
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("DB Error");
      expect(result.current.tasks).toHaveLength(0);
    });

    it("retries on DB9 error", async () => {
      vi.useFakeTimers();
      const db9Error = { code: "DB9" };
      vi.mocked(getDatabase)
        .mockRejectedValueOnce(db9Error)
        .mockResolvedValueOnce(mockDb as any);

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.initializeTasks("user1");
      });

      // Should not set error for DB9
      expect(result.current.error).toBeNull();

      // Fast forward timer
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Should have retried
      expect(getDatabase).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it("subscribes to real-time updates", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.initializeTasks("user1");
      });

      // Simulate a real-time update
      const updatedTasks = [...mockTasks];
      updatedTasks[0].title = "Updated Task 1";

      const subscribeCallback = mockQuery.$.subscribe.mock.calls[0][0];
      act(() => {
        subscribeCallback(
          updatedTasks.map((task) => ({
            toJSON: () => task,
          }))
        );
      });

      expect(result.current.tasks[0].title).toBe("Updated Task 1");
    });
  });

  describe("createTask", () => {
    it("creates a new task", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.createTask({
          title: "New Task",
          x: 50,
          y: 50,
        });
      });

      expect(mockDb.tasks.insert).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: "user1",
        title: "New Task",
        x: 50,
        y: 50,
        checklist: expect.any(Array),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it("handles floating point precision for coordinates", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.createTask({
          title: "New Task",
          x: 74.6799999,
          y: 51.8399999,
        });
      });

      expect(mockDb.tasks.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          x: 74.68,
          y: 51.84,
        })
      );
    });

    it("generates default checklist", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.createTask({
          title: "New Task",
          x: 50,
          y: 50,
        });
      });

      const insertCall = mockDb.tasks.insert.mock.calls[0][0];
      expect(insertCall.checklist).toHaveLength(5);
      expect(insertCall.checklist[0]).toHaveProperty("text");
      expect(insertCall.checklist[0]).toHaveProperty("status", "not-started");
      expect(insertCall.checklist[0]).toHaveProperty("id");
    });

    it("handles error when user not logged in", async () => {
      (useAuthStore as any).getState = vi.fn(() => ({ currentUser: null }));

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.createTask({
          title: "New Task",
          x: 50,
          y: 50,
        });
      });

      expect(result.current.error).toBe("User not logged in");
      expect(mockDb.tasks.insert).not.toHaveBeenCalled();
    });

    it("handles database errors", async () => {
      mockDb.tasks.insert.mockRejectedValueOnce(new Error("Insert failed"));

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.createTask({
          title: "New Task",
          x: 50,
          y: 50,
        });
      });

      expect(result.current.error).toBe("Insert failed");
    });
  });

  describe("updateTask", () => {
    it("updates an existing task", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateTask("1", { title: "Updated Title" });
      });

      expect(mockTaskDoc.patch).toHaveBeenCalledWith({
        title: "Updated Title",
        updatedAt: expect.any(Number),
      });
    });

    it("handles floating point precision for coordinate updates", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateTask("1", {
          x: 33.3333333,
          y: 66.6666666,
        });
      });

      expect(mockTaskDoc.patch).toHaveBeenCalledWith({
        x: 33.33,
        y: 66.67,
        updatedAt: expect.any(Number),
      });
    });

    it("does not round non-coordinate updates", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateTask("1", {
          title: "New Title",
          checklist: [],
        });
      });

      expect(mockTaskDoc.patch).toHaveBeenCalledWith({
        title: "New Title",
        checklist: [],
        updatedAt: expect.any(Number),
      });
    });

    it("handles task not found", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateTask("999", { title: "Updated" });
      });

      expect(mockTaskDoc.patch).not.toHaveBeenCalled();
    });

    it("handles database errors", async () => {
      mockTaskDoc.patch.mockRejectedValueOnce(new Error("Update failed"));

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateTask("1", { title: "Updated" });
      });

      expect(result.current.error).toBe("Update failed");
    });
  });

  describe("deleteTask", () => {
    it("deletes an existing task", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.deleteTask("1");
      });

      expect(mockTaskDoc.remove).toHaveBeenCalledOnce();
    });

    it("handles task not found", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.deleteTask("999");
      });

      expect(mockTaskDoc.remove).not.toHaveBeenCalled();
    });

    it("handles database errors", async () => {
      mockTaskDoc.remove.mockRejectedValueOnce(new Error("Delete failed"));

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.deleteTask("1");
      });

      expect(result.current.error).toBe("Delete failed");
    });
  });

  describe("updateChecklistItem", () => {
    it("updates a checklist item", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateChecklistItem("1", "c1", {
          status: "done",
        });
      });

      expect(mockTaskDoc.patch).toHaveBeenCalledWith({
        checklist: [{ id: "c1", text: "Item 1", status: "done" }],
        updatedAt: expect.any(Number),
      });
    });

    it("updates checklist item text", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateChecklistItem("1", "c1", {
          text: "Updated Item",
        });
      });

      expect(mockTaskDoc.patch).toHaveBeenCalledWith({
        checklist: [{ id: "c1", text: "Updated Item", status: "not-started" }],
        updatedAt: expect.any(Number),
      });
    });

    it("handles checklist item not found", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateChecklistItem("1", "c999", {
          status: "done",
        });
      });

      expect(mockTaskDoc.patch).toHaveBeenCalledWith({
        checklist: mockTasks[0].checklist, // Unchanged
        updatedAt: expect.any(Number),
      });
    });

    it("handles task not found", async () => {
      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateChecklistItem("999", "c1", {
          status: "done",
        });
      });

      expect(mockTaskDoc.patch).not.toHaveBeenCalled();
    });

    it("handles database errors", async () => {
      mockTaskDoc.patch.mockRejectedValueOnce(new Error("Update failed"));

      const { result } = renderHook(() => useTaskStore());

      await act(async () => {
        await result.current.updateChecklistItem("1", "c1", {
          status: "done",
        });
      });

      expect(result.current.error).toBe("Update failed");
    });
  });

  describe("cleanup", () => {
    it("unsubscribes and resets state", async () => {
      const { result } = renderHook(() => useTaskStore());

      // Initialize first
      await act(async () => {
        await result.current.initializeTasks("user1");
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.subscription).not.toBeNull();

      // Cleanup
      act(() => {
        result.current.cleanup();
      });

      expect(mockSubscription.unsubscribe).toHaveBeenCalledOnce();
      expect(result.current.tasks).toHaveLength(0);
      expect(result.current.subscription).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("handles cleanup when no subscription exists", () => {
      const { result } = renderHook(() => useTaskStore());

      // Cleanup without initialization
      expect(() => {
        act(() => {
          result.current.cleanup();
        });
      }).not.toThrow();

      expect(result.current.tasks).toHaveLength(0);
    });
  });
});

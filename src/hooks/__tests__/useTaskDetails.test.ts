import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskDetails } from "../useTaskDetails";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";

// Mock the stores
vi.mock("@/stores/taskStore");
vi.mock("@/stores/uiStore");

describe("useTaskDetails", () => {
  const mockTask = {
    id: "1",
    title: "Test Task",
    userId: "user1",
    x: 50,
    y: 50,
    checklist: [
      { id: "c1", text: "Item 1", status: "not-started" },
      { id: "c2", text: "Item 2", status: "done" },
      { id: "c3", text: "Item 3", status: "blocked" },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockUpdateTask = vi.fn();
  const mockUpdateChecklistItem = vi.fn();
  const mockSetSelectedTaskId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useTaskStore with selector support
    vi.mocked(useTaskStore).mockImplementation((selector?: any) => {
      const state = {
        tasks: [mockTask],
        updateTask: mockUpdateTask,
        updateChecklistItem: mockUpdateChecklistItem,
        deleteTask: vi.fn(),
        createTask: vi.fn(),
        initializeTasks: vi.fn(),
        cleanup: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    // Mock useUIStore with selector support
    vi.mocked(useUIStore).mockImplementation((selector?: any) => {
      const state = {
        selectedTaskId: "1",
        setSelectedTaskId: mockSetSelectedTaskId,
        hoveredTaskId: null,
        setHoveredTaskId: vi.fn(),
        floorPlanImage: null,
        setFloorPlanImage: vi.fn(),
        isAddingTask: false,
        setIsAddingTask: vi.fn(),
      };
      return selector ? selector(state) : state;
    });
  });

  it("returns selected task based on selectedTaskId", () => {
    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.selectedTask).toEqual(mockTask);
  });

  it("returns undefined when no task is selected", () => {
    vi.mocked(useUIStore).mockImplementation((selector?: any) => {
      const state = {
        selectedTaskId: null,
        setSelectedTaskId: mockSetSelectedTaskId,
        hoveredTaskId: null,
        setHoveredTaskId: vi.fn(),
        floorPlanImage: null,
        setFloorPlanImage: vi.fn(),
        isAddingTask: false,
        setIsAddingTask: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.selectedTask).toBeUndefined();
  });

  it("initializes newTitle with selected task title", () => {
    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.newTitle).toBe("Test Task");
  });

  it("handles close action correctly", () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.handleClose();
    });

    expect(mockSetSelectedTaskId).toHaveBeenCalledWith(null);
    expect(result.current.editingTitle).toBe(false);
  });

  it("handles title update when title has changed", async () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.setNewTitle("Updated Task Title");
    });

    await act(async () => {
      await result.current.handleUpdateTitle();
    });

    expect(mockUpdateTask).toHaveBeenCalledWith("1", {
      title: "Updated Task Title",
    });
    expect(result.current.editingTitle).toBe(false);
  });

  it("does not update title when unchanged", async () => {
    const { result } = renderHook(() => useTaskDetails());

    await act(async () => {
      await result.current.handleUpdateTitle();
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  it("trims whitespace from title update", async () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.setNewTitle("  Updated Title  ");
    });

    await act(async () => {
      await result.current.handleUpdateTitle();
    });

    expect(mockUpdateTask).toHaveBeenCalledWith("1", {
      title: "Updated Title",
    });
  });

  it("handles adding new checklist item", async () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.setNewItemText("New checklist item");
    });

    await act(async () => {
      await result.current.handleAddItem();
    });

    expect(mockUpdateTask).toHaveBeenCalledWith("1", {
      checklist: [
        ...mockTask.checklist,
        {
          id: expect.any(String),
          text: "New checklist item",
          status: "not-started",
        },
      ],
    });

    expect(result.current.newItemText).toBe("");
    expect(result.current.showNewItemInput).toBe(false);
  });

  it("shows and hides new item input", () => {
    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.showNewItemInput).toBe(false);

    act(() => {
      result.current.handleShowNewItemInput();
    });

    expect(result.current.showNewItemInput).toBe(true);

    act(() => {
      result.current.handleCancelNewItem();
    });

    expect(result.current.showNewItemInput).toBe(false);
    expect(result.current.newItemText).toBe("");
  });

  it("cancels new item and clears text", () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.handleShowNewItemInput();
      result.current.setNewItemText("Some text");
    });

    expect(result.current.showNewItemInput).toBe(true);
    expect(result.current.newItemText).toBe("Some text");

    act(() => {
      result.current.handleCancelNewItem();
    });

    expect(result.current.showNewItemInput).toBe(false);
    expect(result.current.newItemText).toBe("");
  });

  it("focuses input when showing new item input", () => {
    const { result } = renderHook(() => useTaskDetails());

    // Create a mock input element
    const mockInput = document.createElement("input");
    const focusSpy = vi.spyOn(mockInput, "focus");

    // Set the ref
    Object.defineProperty(result.current.newItemInputRef, "current", {
      writable: true,
      value: mockInput,
    });

    act(() => {
      result.current.handleShowNewItemInput();
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it("clears new item input when closing modal", () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.handleShowNewItemInput();
      result.current.setNewItemText("Some text");
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.showNewItemInput).toBe(false);
    expect(result.current.newItemText).toBe("");
    expect(mockSetSelectedTaskId).toHaveBeenCalledWith(null);
  });

  it("does not add empty checklist item", async () => {
    const { result } = renderHook(() => useTaskDetails());

    act(() => {
      result.current.setNewItemText("   ");
    });

    await act(async () => {
      await result.current.handleAddItem();
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  it("handles deleting checklist item", async () => {
    const { result } = renderHook(() => useTaskDetails());

    await act(async () => {
      await result.current.handleDeleteItem("c2");
    });

    expect(mockUpdateTask).toHaveBeenCalledWith("1", {
      checklist: [mockTask.checklist[0], mockTask.checklist[2]],
    });
  });

  it("handles updating checklist item", async () => {
    const { result } = renderHook(() => useTaskDetails());

    await act(async () => {
      await result.current.handleUpdateChecklistItem("c1", { status: "done" });
    });

    expect(mockUpdateChecklistItem).toHaveBeenCalledWith("1", "c1", {
      status: "done",
    });
  });

  it("correctly identifies when task has blocked items", () => {
    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.hasBlockedItems).toBe(true);
  });

  it("correctly identifies when task has no blocked items", () => {
    vi.mocked(useTaskStore).mockImplementation((selector?: any) => {
      const state = {
        tasks: [
          {
            ...mockTask,
            checklist: [
              { id: "c1", text: "Item 1", status: "not-started" },
              { id: "c2", text: "Item 2", status: "done" },
            ],
          },
        ],
        updateTask: mockUpdateTask,
        updateChecklistItem: mockUpdateChecklistItem,
        deleteTask: vi.fn(),
        createTask: vi.fn(),
        initializeTasks: vi.fn(),
        cleanup: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.hasBlockedItems).toBe(false);
  });

  it("handles expansion state correctly", () => {
    const { result } = renderHook(() => useTaskDetails());

    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.setIsExpanded(false);
    });

    expect(result.current.isExpanded).toBe(false);
  });
});

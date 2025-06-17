import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFloorPlan } from "../useFloorPlan";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";

// Mock the stores
vi.mock("@/stores/taskStore");
vi.mock("@/stores/uiStore");

describe("useFloorPlan", () => {
  const mockTasks = [
    {
      id: "1",
      title: "Task 1",
      x: 25,
      y: 30,
      checklist: [],
    },
    {
      id: "2",
      title: "Task 2",
      x: 75,
      y: 60,
      checklist: [],
    },
  ];

  const mockCreateTask = vi.fn();
  const mockSetSelectedTaskId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTaskStore).mockReturnValue({
      tasks: mockTasks,
      createTask: mockCreateTask,
    } as any);

    vi.mocked(useUIStore).mockReturnValue({
      selectedTaskId: null,
      setSelectedTaskId: mockSetSelectedTaskId,
      floorPlanImage: "/floor-plan.png",
    } as any);
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useFloorPlan());

    expect(result.current.isAddingTask).toBe(false);
    expect(result.current.tempMarker).toBeNull();
    expect(result.current.newTaskTitle).toBe("");
    expect(result.current.showTaskModal).toBe(false);
    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.floorPlanImage).toBe("/floor-plan.png");
  });

  it("toggles adding mode", () => {
    const { result } = renderHook(() => useFloorPlan());

    act(() => {
      result.current.toggleAddingMode();
    });

    expect(result.current.isAddingTask).toBe(true);

    act(() => {
      result.current.toggleAddingMode();
    });

    expect(result.current.isAddingTask).toBe(false);
  });

  it("resets state when canceling add mode", () => {
    const { result } = renderHook(() => useFloorPlan());

    // Set up some state
    act(() => {
      result.current.toggleAddingMode();
      result.current.setNewTaskTitle("Test Task");
    });

    // Toggle off
    act(() => {
      result.current.toggleAddingMode();
    });

    expect(result.current.tempMarker).toBeNull();
    expect(result.current.showTaskModal).toBe(false);
    expect(result.current.newTaskTitle).toBe("");
  });

  it("handles floor plan click when adding task", () => {
    const { result } = renderHook(() => useFloorPlan());

    // Mock getBoundingClientRect
    const mockRect = {
      left: 100,
      top: 50,
      width: 800,
      height: 600,
    };

    // Create a mock element with getBoundingClientRect
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    // Set the ref
    Object.defineProperty(result.current.containerRef, "current", {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.toggleAddingMode();
    });

    const mockEvent = {
      clientX: 500, // 400px from left = 50% of width
      clientY: 350, // 300px from top = 50% of height
    } as React.MouseEvent<HTMLDivElement>;

    act(() => {
      result.current.handleFloorPlanClick(mockEvent);
    });

    expect(result.current.tempMarker).toEqual({ x: 50, y: 50 });
    expect(result.current.showTaskModal).toBe(true);
  });

  it("does not handle click when not in adding mode", () => {
    const { result } = renderHook(() => useFloorPlan());

    const mockEvent = {} as React.MouseEvent<HTMLDivElement>;

    act(() => {
      result.current.handleFloorPlanClick(mockEvent);
    });

    expect(result.current.tempMarker).toBeNull();
    expect(result.current.showTaskModal).toBe(false);
  });

  it("ensures coordinates are rounded to 2 decimal places", () => {
    const { result } = renderHook(() => useFloorPlan());

    const mockRect = {
      left: 0,
      top: 0,
      width: 1000,
      height: 1000,
    };

    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    Object.defineProperty(result.current.containerRef, "current", {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.toggleAddingMode();
    });

    const mockEvent = {
      clientX: 333.333333, // Should become 33.33
      clientY: 666.666666, // Should become 66.67
    } as React.MouseEvent<HTMLDivElement>;

    act(() => {
      result.current.handleFloorPlanClick(mockEvent);
    });

    expect(result.current.tempMarker).toEqual({ x: 33.33, y: 66.67 });
  });

  it("creates task with proper data", async () => {
    const { result } = renderHook(() => useFloorPlan());

    act(() => {
      result.current.setNewTaskTitle("New Task");
    });

    // Set temp marker as if user clicked
    act(() => {
      result.current.toggleAddingMode();
    });

    const mockRect = { left: 0, top: 0, width: 100, height: 100 };
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    Object.defineProperty(result.current.containerRef, "current", {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.handleFloorPlanClick({
        clientX: 50,
        clientY: 30,
      } as React.MouseEvent<HTMLDivElement>);
    });

    await act(async () => {
      await result.current.handleCreateTask();
    });

    expect(mockCreateTask).toHaveBeenCalledWith({
      title: "New Task",
      x: 50,
      y: 30,
    });

    expect(result.current.newTaskTitle).toBe("");
    expect(result.current.tempMarker).toBeNull();
    expect(result.current.showTaskModal).toBe(false);
    expect(result.current.isAddingTask).toBe(false);
  });

  it("does not create task without title", async () => {
    const { result } = renderHook(() => useFloorPlan());

    act(() => {
      result.current.setNewTaskTitle("   "); // Only whitespace
    });

    await act(async () => {
      await result.current.handleCreateTask();
    });

    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it("does not create task without temp marker", async () => {
    const { result } = renderHook(() => useFloorPlan());

    act(() => {
      result.current.setNewTaskTitle("Task Title");
    });

    await act(async () => {
      await result.current.handleCreateTask();
    });

    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it("handles cancel task action", () => {
    const { result } = renderHook(() => useFloorPlan());

    // Set up some state
    act(() => {
      result.current.setNewTaskTitle("Test Task");
      result.current.toggleAddingMode();
    });

    const mockRect = { left: 0, top: 0, width: 100, height: 100 };
    const mockElement = document.createElement("div");
    mockElement.getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    Object.defineProperty(result.current.containerRef, "current", {
      writable: true,
      value: mockElement,
    });

    act(() => {
      result.current.handleFloorPlanClick({
        clientX: 50,
        clientY: 30,
      } as React.MouseEvent<HTMLDivElement>);
    });

    expect(result.current.newTaskTitle).toBe("Test Task");
    expect(result.current.tempMarker).not.toBeNull();
    expect(result.current.showTaskModal).toBe(true);

    act(() => {
      result.current.handleCancelTask();
    });

    expect(result.current.newTaskTitle).toBe("");
    expect(result.current.tempMarker).toBeNull();
    expect(result.current.showTaskModal).toBe(false);
  });

  it("handles task selection", () => {
    const { result } = renderHook(() => useFloorPlan());

    act(() => {
      result.current.setSelectedTaskId("task-123");
    });

    expect(mockSetSelectedTaskId).toHaveBeenCalledWith("task-123");
  });
});

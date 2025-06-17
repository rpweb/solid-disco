import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "../TaskList";
import { useTaskStore } from "@/stores/taskStore";
import { useUIStore } from "@/stores/uiStore";

// Mock the stores
vi.mock("@/stores/taskStore");
vi.mock("@/stores/uiStore");

describe("TaskList", () => {
  const mockDeleteTask = vi.fn();
  const mockSetSelectedTaskId = vi.fn();
  const mockSetHoveredTaskId = vi.fn();

  const mockTasks = [
    {
      id: "1",
      userId: "user1",
      title: "Task 1",
      x: 25.5,
      y: 30.2,
      checklist: [
        { id: "c1", text: "Item 1", status: "done" as const },
        { id: "c2", text: "Item 2", status: "in-progress" as const },
        { id: "c3", text: "Item 3", status: "not-started" as const },
      ],
      createdAt: 1234567890,
      updatedAt: 1234567890,
    },
    {
      id: "2",
      userId: "user1",
      title: "Task 2",
      x: 50.0,
      y: 60.0,
      checklist: [
        { id: "c4", text: "Item 4", status: "blocked" as const },
        { id: "c5", text: "Item 5", status: "final-check" as const },
      ],
      createdAt: 1234567891,
      updatedAt: 1234567891,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: mockTasks,
      deleteTask: mockDeleteTask,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      updateChecklistItem: vi.fn(),
      initializeTasks: vi.fn(),
    } as any);
    vi.mocked(useUIStore).mockReturnValue({
      selectedTaskId: null,
      setSelectedTaskId: mockSetSelectedTaskId,
      hoveredTaskId: null,
      setHoveredTaskId: mockSetHoveredTaskId,
      floorPlanImage: null,
      setFloorPlanImage: vi.fn(),
    } as any);
  });

  it("renders task count in header", () => {
    render(<TaskList />);
    expect(screen.getByText("Tasks (2)")).toBeInTheDocument();
  });

  it("shows empty state when no tasks", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [],
      deleteTask: mockDeleteTask,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      updateChecklistItem: vi.fn(),
      initializeTasks: vi.fn(),
    } as any);

    render(<TaskList />);
    expect(
      screen.getByText(
        'No tasks yet. Click "Add Task" on the floor plan to create one.'
      )
    ).toBeInTheDocument();
  });

  it("renders all tasks", () => {
    render(<TaskList />);

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Position: (25.5%, 30.2%)")).toBeInTheDocument();
    expect(screen.getByText("Position: (50.0%, 60.0%)")).toBeInTheDocument();
  });

  it("shows progress information", () => {
    render(<TaskList />);

    // Task 1: 1 of 3 completed (33%)
    expect(screen.getByText("1 of 3 completed")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument();

    // Task 2: 0 of 2 completed (0%)
    expect(screen.getByText("0 of 2 completed")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders checklist item previews", () => {
    render(<TaskList />);

    // First task checklist items
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("+1 more items")).toBeInTheDocument();

    // Second task checklist items
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.getByText("Final Check")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
  });

  it("selects task when clicked", async () => {
    const user = userEvent.setup();
    render(<TaskList />);

    const task1Button = screen.getByRole("button", {
      name: /Select task: Task 1/i,
    });
    await user.click(task1Button);

    expect(mockSetSelectedTaskId).toHaveBeenCalledWith("1");
  });

  it("highlights selected task", () => {
    vi.mocked(useUIStore).mockReturnValue({
      selectedTaskId: "1",
      setSelectedTaskId: mockSetSelectedTaskId,
      hoveredTaskId: null,
      setHoveredTaskId: mockSetHoveredTaskId,
      floorPlanImage: null,
      setFloorPlanImage: vi.fn(),
    } as any);

    render(<TaskList />);

    const task1Button = screen.getByRole("button", {
      name: /Select task: Task 1/i,
    });
    expect(task1Button).toHaveClass("bg-blue-50");
  });

  it("deletes task when delete button clicked and confirmed", async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => true);

    render(<TaskList />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /Delete task:/i,
    });
    await user.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith("Delete this task?");
    expect(mockDeleteTask).toHaveBeenCalledWith("1");
  });

  it("does not delete task when delete is cancelled", async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => false);

    render(<TaskList />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /Delete task:/i,
    });
    await user.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith("Delete this task?");
    expect(mockDeleteTask).not.toHaveBeenCalled();
  });

  it("prevents event propagation when delete button is clicked", async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => true);

    render(<TaskList />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /Delete task:/i,
    });
    await user.click(deleteButtons[0]);

    // The task should not be selected when delete is clicked
    expect(mockSetSelectedTaskId).not.toHaveBeenCalled();
  });

  it("handles tasks with empty checklists", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      tasks: [
        {
          ...mockTasks[0],
          checklist: [],
        },
      ],
      deleteTask: mockDeleteTask,
      createTask: vi.fn(),
      updateTask: vi.fn(),
      updateChecklistItem: vi.fn(),
      initializeTasks: vi.fn(),
    } as any);

    render(<TaskList />);

    expect(screen.getByText("0 of 0 completed")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("applies correct status colors", () => {
    render(<TaskList />);

    const doneStatus = screen.getByText("Done");
    expect(doneStatus).toHaveClass("bg-green-100", "text-green-800");

    const inProgressStatus = screen.getByText("In Progress");
    expect(inProgressStatus).toHaveClass("bg-yellow-100", "text-yellow-800");

    const blockedStatus = screen.getByText("Blocked");
    expect(blockedStatus).toHaveClass("bg-red-100", "text-red-800");

    const finalCheckStatus = screen.getByText("Final Check");
    expect(finalCheckStatus).toHaveClass("bg-blue-100", "text-blue-800");
  });
});

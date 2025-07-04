import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "../TaskList";
import { useTaskStore, type TaskState } from "@/stores/taskStore";
import { useUIStore, type UIState } from "@/stores/uiStore";
import type { RxTaskDocumentType } from "@/types/db.types";
import { CHECKLIST_STATUS } from "@/types/db.types";

// Mock the stores
vi.mock("@/stores/taskStore");
vi.mock("@/stores/uiStore");

describe("TaskList", () => {
  const mockDeleteTask = vi.fn();
  const mockSetSelectedTaskId = vi.fn();
  const mockSetHoveredTaskId = vi.fn();

  const mockTasks: RxTaskDocumentType[] = [
    {
      id: "1",
      userId: "user1",
      title: "Task 1",
      x: 25.5,
      y: 30.2,
      checklist: [
        { id: "c1", text: "Item 1", status: CHECKLIST_STATUS.DONE },
        { id: "c2", text: "Item 2", status: CHECKLIST_STATUS.IN_PROGRESS },
        { id: "c3", text: "Item 3", status: CHECKLIST_STATUS.NOT_STARTED },
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
        { id: "c4", text: "Item 4", status: CHECKLIST_STATUS.BLOCKED },
        { id: "c5", text: "Item 5", status: CHECKLIST_STATUS.FINAL_CHECK },
      ],
      createdAt: 1234567891,
      updatedAt: 1234567891,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useTaskStore with selector support
    vi.mocked(useTaskStore).mockImplementation(
      <T,>(selector?: (state: TaskState) => T) => {
        const state: TaskState = {
          tasks: mockTasks,
          isLoading: false,
          error: null,
          subscription: null,
          deleteTask: mockDeleteTask,
          createTask: vi.fn(),
          updateTask: vi.fn(),
          updateChecklistItem: vi.fn(),
          initializeTasks: vi.fn(),
          cleanup: vi.fn(),
        };
        return selector ? selector(state) : (state as T);
      }
    );

    // Mock useUIStore with selector support
    vi.mocked(useUIStore).mockImplementation(
      <T,>(selector?: (state: UIState) => T) => {
        const state: UIState = {
          isAddingTask: false,
          selectedTaskId: null,
          hoveredTaskId: null,
          floorPlanImage: null,
          setIsAddingTask: vi.fn(),
          setSelectedTaskId: mockSetSelectedTaskId,
          setHoveredTaskId: mockSetHoveredTaskId,
          setFloorPlanImage: vi.fn(),
        };
        return selector ? selector(state) : (state as T);
      }
    );
  });

  it("renders task count in header", () => {
    render(<TaskList />);
    expect(screen.getByText("Tasks (2)")).toBeInTheDocument();
  });

  it("shows empty state when no tasks", () => {
    // Mock useTaskStore with empty tasks
    vi.mocked(useTaskStore).mockImplementation(
      <T,>(selector?: (state: TaskState) => T) => {
        const state: TaskState = {
          tasks: [],
          isLoading: false,
          error: null,
          subscription: null,
          deleteTask: mockDeleteTask,
          createTask: vi.fn(),
          updateTask: vi.fn(),
          updateChecklistItem: vi.fn(),
          initializeTasks: vi.fn(),
          cleanup: vi.fn(),
        };
        return selector ? selector(state) : (state as T);
      }
    );

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
    // Mock useUIStore with selector support for selectedTaskId = "1"
    vi.mocked(useUIStore).mockImplementation(
      <T,>(selector?: (state: UIState) => T) => {
        const state: UIState = {
          isAddingTask: false,
          selectedTaskId: "1",
          hoveredTaskId: null,
          floorPlanImage: null,
          setIsAddingTask: vi.fn(),
          setSelectedTaskId: mockSetSelectedTaskId,
          setHoveredTaskId: mockSetHoveredTaskId,
          setFloorPlanImage: vi.fn(),
        };
        return selector ? selector(state) : (state as T);
      }
    );

    render(<TaskList />);

    // Find the parent div that contains the task
    const task1Button = screen.getByRole("button", {
      name: /Select task: Task 1/i,
    });
    const taskContainer = task1Button.closest("div.px-6.py-4");
    expect(taskContainer).toHaveClass("bg-blue-50");
  });

  it("renders delete buttons for each task", () => {
    render(<TaskList />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /Delete Task/i,
    });

    expect(deleteButtons).toHaveLength(2);
    expect(deleteButtons[0]).toHaveAttribute("aria-label", "Delete Task 1");
    expect(deleteButtons[1]).toHaveAttribute("aria-label", "Delete Task 2");
  });

  it("prevents event propagation when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskList />);

    const deleteButtons = screen.getAllByRole("button", {
      name: /Delete Task/i,
    });
    await user.click(deleteButtons[0]);

    // The task should not be selected when delete is clicked
    expect(mockSetSelectedTaskId).not.toHaveBeenCalled();
  });

  it("handles tasks with empty checklists", () => {
    // Mock useTaskStore with task that has empty checklist
    vi.mocked(useTaskStore).mockImplementation(
      <T,>(selector?: (state: TaskState) => T) => {
        const state: TaskState = {
          tasks: [
            {
              ...mockTasks[0],
              checklist: [],
            },
          ],
          isLoading: false,
          error: null,
          subscription: null,
          deleteTask: mockDeleteTask,
          createTask: vi.fn(),
          updateTask: vi.fn(),
          updateChecklistItem: vi.fn(),
          initializeTasks: vi.fn(),
          cleanup: vi.fn(),
        };
        return selector ? selector(state) : (state as T);
      }
    );

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

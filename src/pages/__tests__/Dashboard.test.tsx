import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "../Dashboard";
import { useAuthStore } from "@/stores/authStore";
import { useTaskStore } from "@/stores/taskStore";

// Mock the components
vi.mock("@/components/tasks/FloorPlan", () => ({
  FloorPlan: () => <div data-testid="floor-plan">Floor Plan</div>,
}));

vi.mock("@/components/tasks/TaskList", () => ({
  TaskList: () => <div data-testid="task-list">Task List</div>,
}));

vi.mock("@/components/tasks/TaskDetails", () => ({
  TaskDetails: () => <div data-testid="task-details">Task Details</div>,
}));

// Mock the stores
vi.mock("@/stores/authStore");
vi.mock("@/stores/taskStore");

describe("Dashboard", () => {
  const mockInitializeTasks = vi.fn();
  const mockCleanup = vi.fn();

  const defaultAuthState = {
    currentUser: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  };

  const defaultTaskState = {
    tasks: [],
    isLoading: false,
    error: null,
    subscription: null,
    initializeTasks: mockInitializeTasks,
    cleanup: mockCleanup,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    updateChecklistItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = defaultAuthState;
      return selector(state);
    });
    vi.mocked(useTaskStore).mockImplementation((selector) => {
      const state = defaultTaskState;
      return selector(state);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render dashboard with all components", () => {
      render(<Dashboard />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(
        screen.getByText("Manage your construction tasks on the floor plan")
      ).toBeInTheDocument();
      expect(screen.getByTestId("floor-plan")).toBeInTheDocument();
      expect(screen.getByTestId("task-list")).toBeInTheDocument();
      expect(screen.getByTestId("task-details")).toBeInTheDocument();
    });

    it("should have proper heading styling", () => {
      render(<Dashboard />);

      const heading = screen.getByText("Dashboard");
      expect(heading).toHaveClass("text-2xl");
      expect(heading).toHaveClass("font-bold");
      expect(heading).toHaveClass("text-gray-900");
    });

    it("should have proper layout", () => {
      const { container } = render(<Dashboard />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).toHaveClass("xl:grid-cols-3");
      expect(grid).toHaveClass("gap-8");

      const floorPlanContainer = container.querySelector(
        ".bg-white.rounded-lg.shadow"
      );
      expect(floorPlanContainer).toHaveClass("xl:col-span-2");
    });
  });

  describe("task initialization", () => {
    it("should initialize tasks when user is logged in", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: {
            id: "user-123",
            name: "John Doe",
            createdAt: Date.now(),
          },
        };
        return selector(state);
      });

      render(<Dashboard />);

      expect(mockInitializeTasks).toHaveBeenCalledWith("user-123");
      expect(mockInitializeTasks).toHaveBeenCalledTimes(1);
    });

    it("should not initialize tasks when user is not logged in", () => {
      render(<Dashboard />);

      expect(mockInitializeTasks).not.toHaveBeenCalled();
    });

    it("should reinitialize tasks when user changes", () => {
      const { rerender } = render(<Dashboard />);

      // Initially no user
      expect(mockInitializeTasks).not.toHaveBeenCalled();

      // Update to have a user
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: {
            id: "user-456",
            name: "Jane Doe",
            createdAt: Date.now(),
          },
        };
        return selector(state);
      });

      rerender(<Dashboard />);

      expect(mockInitializeTasks).toHaveBeenCalledWith("user-456");
    });
  });

  describe("cleanup", () => {
    it("should call cleanup on unmount", () => {
      const { unmount } = render(<Dashboard />);

      expect(mockCleanup).not.toHaveBeenCalled();

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it("should call cleanup when user changes", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: {
            id: "user-123",
            name: "John Doe",
            createdAt: Date.now(),
          },
        };
        return selector(state);
      });

      const { rerender } = render(<Dashboard />);

      // Change user
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: {
            id: "user-456",
            name: "Jane Doe",
            createdAt: Date.now(),
          },
        };
        return selector(state);
      });

      rerender(<Dashboard />);

      // Cleanup should be called when effect dependencies change
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("should have proper description styling", () => {
      render(<Dashboard />);

      const description = screen.getByText(
        "Manage your construction tasks on the floor plan"
      );
      expect(description).toHaveClass("mt-1");
      expect(description).toHaveClass("text-sm");
      expect(description).toHaveClass("text-gray-600");
    });

    it("should have proper container styling", () => {
      const { container } = render(<Dashboard />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toBeInTheDocument();

      const headerDiv = container.querySelector(".mb-8");
      expect(headerDiv).toBeInTheDocument();
    });
  });
});

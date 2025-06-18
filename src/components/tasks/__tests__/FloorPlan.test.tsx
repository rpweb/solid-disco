import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FloorPlan } from "../FloorPlan";
import { useFloorPlan } from "@/hooks/useFloorPlan";
import { useZoom } from "@/hooks/useZoom";

// Mock the custom hooks
vi.mock("@/hooks/useFloorPlan");
vi.mock("@/hooks/useZoom");

// Mock the ZoomControls component
vi.mock("../ZoomControls", () => ({
  ZoomControls: vi.fn(() => null),
}));

describe("FloorPlan", () => {
  const mockFloorPlanProps = {
    containerRef: { current: null },
    isAddingTask: false,
    tempMarker: null,
    newTaskTitle: "",
    setNewTaskTitle: vi.fn(),
    showTaskModal: false,
    tasks: [
      {
        id: "1",
        title: "Test Task 1",
        x: 25,
        y: 30,
        checklist: [{ status: "done" }, { status: "not-started" }],
      },
      {
        id: "2",
        title: "Test Task 2",
        x: 75,
        y: 60,
        checklist: [],
      },
    ],
    selectedTaskId: null,
    setSelectedTaskId: vi.fn(),
    hoveredTaskId: null,
    floorPlanImage: "/test-floor-plan.png",
    handleFloorPlanClick: vi.fn(),
    handleCreateTask: vi.fn(),
    handleCancelTask: vi.fn(),
    toggleAddingMode: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
  };

  const mockZoomProps = {
    zoomLevel: 1,
    setZoomLevel: vi.fn(),
    handleZoomIn: vi.fn(),
    handleZoomOut: vi.fn(),
    handleResetZoom: vi.fn(),
    minZoom: 1,
    maxZoom: 2.5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFloorPlan).mockReturnValue(mockFloorPlanProps as any);
    vi.mocked(useZoom).mockReturnValue(mockZoomProps);
  });

  it("renders floor plan with title and add button", () => {
    render(<FloorPlan />);

    expect(screen.getByText("Floor Plan")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Task" })
    ).toBeInTheDocument();
  });

  it("displays floor plan image when provided", () => {
    render(<FloorPlan />);

    const img = screen.getByAltText("Floor Plan");
    expect(img).toHaveAttribute("src", "/test-floor-plan.png");
  });

  it("shows placeholder when no floor plan image", () => {
    vi.mocked(useFloorPlan).mockReturnValue({
      ...mockFloorPlanProps,
      floorPlanImage: null,
    } as any);

    render(<FloorPlan />);

    expect(
      screen.getByText("No floor plan image uploaded")
    ).toBeInTheDocument();
  });

  it("renders all task markers", () => {
    render(<FloorPlan />);

    const taskMarkers = screen.getAllByText("T");
    expect(taskMarkers).toHaveLength(2); // Two tasks
    // Progress indicators are no longer shown as text, they're pie charts
  });

  it("toggles adding mode when button is clicked", async () => {
    const user = userEvent.setup();
    render(<FloorPlan />);

    const addButton = screen.getByRole("button", { name: "Add Task" });
    await user.click(addButton);

    expect(mockFloorPlanProps.toggleAddingMode).toHaveBeenCalledOnce();
  });

  it("shows cancel button and instructions when in adding mode", () => {
    vi.mocked(useFloorPlan).mockReturnValue({
      ...mockFloorPlanProps,
      isAddingTask: true,
    } as any);

    render(<FloorPlan />);

    expect(
      screen.getByRole("button", { name: "Cancel Adding" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Click anywhere on the floor plan to place a new task")
    ).toBeInTheDocument();
  });

  it("handles floor plan click", async () => {
    const user = userEvent.setup();
    render(<FloorPlan />);

    const floorPlanContainer = screen.getByAltText("Floor Plan").parentElement!;
    await user.click(floorPlanContainer);

    expect(mockFloorPlanProps.handleFloorPlanClick).toHaveBeenCalled();
  });

  it("shows temporary marker when placing a task", () => {
    vi.mocked(useFloorPlan).mockReturnValue({
      ...mockFloorPlanProps,
      isAddingTask: true,
      tempMarker: { x: 50, y: 50 },
    } as any);

    const { container } = render(<FloorPlan />);

    const tempMarker = container.querySelector(
      'div[style*="left: 50%"][style*="top: 50%"]'
    );
    expect(tempMarker).toBeInTheDocument();

    const animatingDiv = tempMarker?.querySelector(".animate-ping");
    expect(animatingDiv).toBeInTheDocument();
  });

  it("renders NewTaskModal when showTaskModal is true", () => {
    vi.mocked(useFloorPlan).mockReturnValue({
      ...mockFloorPlanProps,
      showTaskModal: true,
      newTaskTitle: "New Task",
    } as any);

    render(<FloorPlan />);

    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter task title...")
    ).toBeInTheDocument();
  });

  it("selects task when marker is clicked", async () => {
    const user = userEvent.setup();
    render(<FloorPlan />);

    const taskMarkers = screen.getAllByText("T");
    const firstTaskMarker = taskMarkers[0].closest("div[style]")!;
    await user.click(firstTaskMarker);

    expect(mockFloorPlanProps.setSelectedTaskId).toHaveBeenCalledWith("1");
  });

  it("applies correct cursor style based on mode", () => {
    const { rerender } = render(<FloorPlan />);

    // The cursor styles are on the div with overflow-auto and bg-gray-100
    let container = document.querySelector(
      ".bg-gray-100.overflow-auto"
    ) as HTMLElement;
    expect(container).toHaveClass("cursor-default");

    vi.mocked(useFloorPlan).mockReturnValue({
      ...mockFloorPlanProps,
      isAddingTask: true,
    } as any);

    rerender(<FloorPlan />);

    container = document.querySelector(
      ".bg-gray-100.overflow-auto"
    ) as HTMLElement;
    expect(container).toHaveClass("cursor-crosshair");
  });

  it("disables task markers when adding a new task", async () => {
    const user = userEvent.setup();
    vi.mocked(useFloorPlan).mockReturnValue({
      ...mockFloorPlanProps,
      isAddingTask: true,
    } as any);

    render(<FloorPlan />);

    // Try to click a task marker
    const taskMarker = screen
      .getAllByText("T")[0]
      .closest("div[role='button']")!;
    await user.click(taskMarker);

    // Should not select the task when in adding mode
    expect(mockFloorPlanProps.setSelectedTaskId).not.toHaveBeenCalled();

    // Check that the marker has disabled attributes
    expect(taskMarker).toHaveAttribute("aria-disabled", "true");
    expect(taskMarker).toHaveClass("cursor-not-allowed", "opacity-50");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskMarker } from "../TaskMarker";

describe("TaskMarker", () => {
  const mockTask = {
    id: "1",
    title: "Test Task",
    x: 50,
    y: 30,
    checklist: [
      { status: "done" },
      { status: "done" },
      { status: "in-progress" },
      { status: "not-started" },
    ],
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders task marker with first letter of title", () => {
    render(
      <TaskMarker task={mockTask} isSelected={false} onClick={mockOnClick} />
    );

    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("positions marker correctly based on x and y coordinates", () => {
    const { container } = render(
      <TaskMarker task={mockTask} isSelected={false} onClick={mockOnClick} />
    );

    const marker = container.firstChild as HTMLElement;
    expect(marker.style.left).toBe("50%");
    expect(marker.style.top).toBe("30%");
  });

  it("shows progress indicator with completed/total count", () => {
    render(
      <TaskMarker task={mockTask} isSelected={false} onClick={mockOnClick} />
    );

    expect(screen.getByText("2/4")).toBeInTheDocument();
  });

  it("applies selected styles when isSelected is true", () => {
    const { container } = render(
      <TaskMarker task={mockTask} isSelected={true} onClick={mockOnClick} />
    );

    const marker = container.firstChild as HTMLElement;
    expect(marker.className).toContain("scale-110");
    expect(marker.className).toContain("z-20");

    const innerDiv = marker.firstChild as HTMLElement;
    expect(innerDiv.className).toContain("animate-pulse");
  });

  it("calls onClick when marker is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TaskMarker task={mockTask} isSelected={false} onClick={mockOnClick} />
    );

    const marker = screen.getByText("T").closest("div[style]") as HTMLElement;
    await user.click(marker);

    expect(mockOnClick).toHaveBeenCalledOnce();
  });

  it("shows tooltip with task title and completion percentage on hover", async () => {
    const user = userEvent.setup();
    render(
      <TaskMarker task={mockTask} isSelected={false} onClick={mockOnClick} />
    );

    const marker = screen.getByText("T").parentElement as HTMLElement;
    await user.hover(marker);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("handles empty checklist correctly", () => {
    const taskWithNoChecklist = { ...mockTask, checklist: [] };
    render(
      <TaskMarker
        task={taskWithNoChecklist}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("0/0")).toBeInTheDocument();
    expect(screen.getByText("0% complete")).toBeInTheDocument();
  });

  it("handles task with all items completed", () => {
    const completedTask = {
      ...mockTask,
      checklist: [{ status: "done" }, { status: "done" }],
    };
    render(
      <TaskMarker
        task={completedTask}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByText("100% complete")).toBeInTheDocument();
  });

  it("uses uppercase first letter for lowercase titles", () => {
    const lowercaseTask = { ...mockTask, title: "lowercase task" };
    render(
      <TaskMarker
        task={lowercaseTask}
        isSelected={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText("L")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
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

    expect(screen.getByText("50% complete")).toBeInTheDocument();
  });

  it("applies selected styles when isSelected is true", () => {
    const { container } = render(
      <TaskMarker task={mockTask} isSelected={true} onClick={mockOnClick} />
    );

    const marker = container.firstChild as HTMLElement;
    expect(marker.className).toContain("scale-110");
    expect(marker.style.zIndex).toBe("20");

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

  it("does not respond to clicks when disabled", async () => {
    const user = userEvent.setup();
    render(
      <TaskMarker
        task={mockTask}
        isSelected={false}
        onClick={mockOnClick}
        disabled
      />
    );

    const marker = screen.getByRole("button");
    await user.click(marker);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("does not respond to keyboard when disabled", async () => {
    const user = userEvent.setup();
    render(
      <TaskMarker
        task={mockTask}
        isSelected={false}
        onClick={mockOnClick}
        disabled
      />
    );

    const marker = screen.getByRole("button");
    marker.focus();

    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("applies disabled styles when disabled", () => {
    render(
      <TaskMarker
        task={mockTask}
        isSelected={false}
        onClick={mockOnClick}
        disabled
      />
    );

    const marker = screen.getByRole("button");
    expect(marker).toHaveClass("cursor-not-allowed", "opacity-50");
    expect(marker).not.toHaveClass("cursor-pointer");
    expect(marker).toHaveAttribute("aria-disabled", "true");
    expect(marker).toHaveAttribute("tabIndex", "-1");
  });
});

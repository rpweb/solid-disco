import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewTaskModal } from "../NewTaskModal";

describe("NewTaskModal", () => {
  const mockProps = {
    newTaskTitle: "",
    setNewTaskTitle: vi.fn(),
    onCancel: vi.fn(),
    onCreate: vi.fn(),
  };

  it("renders modal with title input and buttons", () => {
    render(<NewTaskModal {...mockProps} />);

    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter task title...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Task" })
    ).toBeInTheDocument();
  });

  it("calls setNewTaskTitle when typing in input", async () => {
    const user = userEvent.setup();
    render(<NewTaskModal {...mockProps} />);

    const input = screen.getByPlaceholderText("Enter task title...");
    await user.type(input, "New Task Name");

    expect(mockProps.setNewTaskTitle).toHaveBeenCalledTimes(13); // Once for each character
  });

  it("Create button is disabled when title is empty", () => {
    render(<NewTaskModal {...mockProps} />);

    const createButton = screen.getByRole("button", { name: "Create Task" });
    expect(createButton).toBeDisabled();
  });

  it("Create button is enabled when title has content", () => {
    render(<NewTaskModal {...mockProps} newTaskTitle="Test Task" />);

    const createButton = screen.getByRole("button", { name: "Create Task" });
    expect(createButton).not.toBeDisabled();
  });

  it("calls onCreate when Create button is clicked", async () => {
    const user = userEvent.setup();
    render(<NewTaskModal {...mockProps} newTaskTitle="Test Task" />);

    const createButton = screen.getByRole("button", { name: "Create Task" });
    await user.click(createButton);

    expect(mockProps.onCreate).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<NewTaskModal {...mockProps} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCreate when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const localMockProps = {
      ...mockProps,
      newTaskTitle: "Test Task",
      onCreate: vi.fn(),
    };
    render(<NewTaskModal {...localMockProps} />);

    const input = screen.getByPlaceholderText("Enter task title...");
    await user.keyboard("{Enter}");

    expect(localMockProps.onCreate).toHaveBeenCalledOnce();
  });

  it("input is autofocused", () => {
    render(<NewTaskModal {...mockProps} />);

    const input = screen.getByPlaceholderText("Enter task title...");
    expect(input).toHaveFocus();
  });
});

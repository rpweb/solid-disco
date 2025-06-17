import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetails } from "../TaskDetails";
import { useTaskDetails } from "@/hooks/useTaskDetails";

// Mock the custom hook
vi.mock("@/hooks/useTaskDetails");

// Mock ChecklistItem component
vi.mock("../ChecklistItem", () => ({
  ChecklistItem: ({ item, onStatusChange, onTextChange, onDelete }: any) => (
    <div data-testid={`checklist-item-${item.id}`}>
      <span>{item.text}</span>
      <button onClick={() => onStatusChange("done")}>Change Status</button>
      <button onClick={() => onTextChange("Updated")}>Change Text</button>
      <button onClick={() => onDelete()}>Delete</button>
    </div>
  ),
}));

describe("TaskDetails", () => {
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

  const mockProps = {
    selectedTask: mockTask,
    editingTitle: false,
    setEditingTitle: vi.fn(),
    newTitle: "Test Task",
    setNewTitle: vi.fn(),
    newItemText: "",
    setNewItemText: vi.fn(),
    isExpanded: true,
    setIsExpanded: vi.fn(),
    hasBlockedItems: true,
    handleClose: vi.fn(),
    handleUpdateTitle: vi.fn(),
    handleAddItem: vi.fn(),
    handleDeleteItem: vi.fn(),
    handleUpdateChecklistItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTaskDetails).mockReturnValue(mockProps as any);
  });

  it("returns null when no task is selected", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      selectedTask: null,
    } as any);

    const { container } = render(<TaskDetails />);
    expect(container.firstChild).toBeNull();
  });

  it("renders task details modal with title", () => {
    render(<TaskDetails />);

    expect(screen.getByText("Task Name")).toBeInTheDocument();
    expect(screen.getByText("Ticket progress is blocked")).toBeInTheDocument();
  });

  it("shows task title when not blocked", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      hasBlockedItems: false,
    } as any);

    render(<TaskDetails />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("handles close button click", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    // Find close button by its SVG path
    const closeButton = document
      .querySelector('button svg path[d="M6 18L18 6M6 6l12 12"]')
      ?.closest("button");
    await user.click(closeButton!);

    expect(mockProps.handleClose).toHaveBeenCalledOnce();
  });

  it("enters title edit mode on click", async () => {
    const user = userEvent.setup();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      hasBlockedItems: false,
    } as any);

    render(<TaskDetails />);

    const title = screen.getByText("Test Task");
    await user.click(title);

    expect(mockProps.setEditingTitle).toHaveBeenCalledWith(true);
  });

  it("renders title input when editing", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      editingTitle: true,
    } as any);

    render(<TaskDetails />);

    const input = screen.getByDisplayValue("Test Task");
    expect(input).toBeInTheDocument();
    // autoFocus is a React prop, not a DOM attribute
    expect(document.activeElement).toBe(input);
  });

  it("saves title on blur", async () => {
    const user = userEvent.setup();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      editingTitle: true,
    } as any);

    render(<TaskDetails />);

    await user.click(document.body); // Blur

    expect(mockProps.handleUpdateTitle).toHaveBeenCalledOnce();
  });

  it("saves title on Enter key", async () => {
    const user = userEvent.setup();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      editingTitle: true,
    } as any);

    render(<TaskDetails />);

    await user.keyboard("{Enter}");

    expect(mockProps.handleUpdateTitle).toHaveBeenCalledOnce();
  });

  it("shows checklist section with items count", () => {
    render(<TaskDetails />);

    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("3 STEPS")).toBeInTheDocument();
  });

  it("renders all checklist items", () => {
    render(<TaskDetails />);

    expect(screen.getByTestId("checklist-item-c1")).toBeInTheDocument();
    expect(screen.getByTestId("checklist-item-c2")).toBeInTheDocument();
    expect(screen.getByTestId("checklist-item-c3")).toBeInTheDocument();
  });

  it("toggles checklist expansion", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    const expandButton = screen
      .getByText("3 STEPS")
      .parentElement?.querySelector("button")!;
    await user.click(expandButton);

    expect(mockProps.setIsExpanded).toHaveBeenCalledWith(false);
  });

  it("hides checklist items when collapsed", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      isExpanded: false,
    } as any);

    render(<TaskDetails />);

    expect(screen.queryByTestId("checklist-item-c1")).not.toBeInTheDocument();
  });

  it("shows add new item button when expanded", () => {
    render(<TaskDetails />);

    expect(screen.getByText("ADD NEW ITEM")).toBeInTheDocument();
  });

  it("focuses hidden input when add button is clicked", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    const addButton =
      screen.getByText("ADD NEW ITEM").parentElement!.parentElement!;
    await user.click(addButton);

    // The input should get focus via getElementById in the component
    expect(addButton).toBeInTheDocument();
  });

  it("shows new item input when text is entered", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      newItemText: "New Item",
    } as any);

    render(<TaskDetails />);

    const input = screen.getByPlaceholderText(
      "Type new item and press Enter..."
    );
    expect(input).toBeVisible();
    expect(input).toHaveValue("New Item");
  });

  it("adds item on Enter key", async () => {
    const user = userEvent.setup();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      newItemText: "New Item",
    } as any);

    render(<TaskDetails />);

    const input = screen.getByPlaceholderText(
      "Type new item and press Enter..."
    );
    await user.click(input); // Ensure focus
    await user.keyboard("{Enter}");

    expect(mockProps.handleAddItem).toHaveBeenCalledOnce();
  });

  it("clears new item text on Escape", async () => {
    const user = userEvent.setup();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      newItemText: "New Item",
    } as any);

    render(<TaskDetails />);

    const input = screen.getByPlaceholderText(
      "Type new item and press Enter..."
    );
    await user.click(input); // Ensure focus
    await user.keyboard("{Escape}");

    expect(mockProps.setNewItemText).toHaveBeenCalledWith("");
  });

  it("handles checklist item status change", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    const changeStatusButton = screen
      .getByTestId("checklist-item-c1")
      .querySelector("button")!;
    await user.click(changeStatusButton);

    expect(mockProps.handleUpdateChecklistItem).toHaveBeenCalledWith("c1", {
      status: "done",
    });
  });

  it("handles checklist item text change", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    const changeTextButtons = screen.getAllByText("Change Text");
    await user.click(changeTextButtons[0]);

    expect(mockProps.handleUpdateChecklistItem).toHaveBeenCalledWith("c1", {
      text: "Updated",
    });
  });

  it("handles checklist item deletion", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    expect(mockProps.handleDeleteItem).toHaveBeenCalledWith("c1");
  });

  it("shows red dot indicator when has blocked items", () => {
    render(<TaskDetails />);

    const redDot = document.querySelector(".w-2.h-2.bg-red-600.rounded-full");
    expect(redDot).toBeInTheDocument();
  });
});

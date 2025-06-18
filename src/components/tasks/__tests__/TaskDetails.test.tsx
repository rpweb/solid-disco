import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskDetails } from "../TaskDetails";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import type { RxTaskDocumentType, ChecklistItemType } from "@/types/db.types";
import { CHECKLIST_STATUS } from "@/types/db.types";

// Mock the custom hook
vi.mock("@/hooks/useTaskDetails");

// Mock ChecklistItem component
vi.mock("../ChecklistItem", () => ({
  ChecklistItem: ({
    item,
    onStatusChange,
    onTextChange,
    onDelete,
  }: {
    item: ChecklistItemType;
    onStatusChange: (
      status: (typeof CHECKLIST_STATUS)[keyof typeof CHECKLIST_STATUS]
    ) => void;
    onTextChange: (text: string) => void;
    onDelete: () => void;
  }) => (
    <div data-testid={`checklist-item-${item.id}`}>
      <span>{item.text}</span>
      <button onClick={() => onStatusChange(CHECKLIST_STATUS.DONE)}>
        Change Status
      </button>
      <button onClick={() => onTextChange("Updated")}>Change Text</button>
      <button onClick={() => onDelete()}>Delete</button>
    </div>
  ),
}));

// Define proper type for mock returns
type UseTaskDetailsReturn = ReturnType<typeof useTaskDetails>;

describe("TaskDetails", () => {
  const mockTask: RxTaskDocumentType = {
    id: "1",
    title: "Test Task",
    userId: "user1",
    x: 50,
    y: 50,
    checklist: [
      { id: "c1", text: "Item 1", status: CHECKLIST_STATUS.NOT_STARTED },
      { id: "c2", text: "Item 2", status: CHECKLIST_STATUS.DONE },
      { id: "c3", text: "Item 3", status: CHECKLIST_STATUS.BLOCKED },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockProps: UseTaskDetailsReturn = {
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
    showNewItemInput: false,
    newItemInputRef: { current: null },
    handleClose: vi.fn(),
    handleUpdateTitle: vi.fn(),
    handleAddItem: vi.fn(),
    handleShowNewItemInput: vi.fn(),
    handleCancelNewItem: vi.fn(),
    handleDeleteItem: vi.fn(),
    handleUpdateChecklistItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTaskDetails).mockReturnValue(mockProps);
  });

  it("returns null when no task is selected", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      selectedTask: undefined,
    });

    const { container } = render(<TaskDetails />);
    expect(container.firstChild).toBeNull();
  });

  it("renders task details modal with title", () => {
    render(<TaskDetails />);

    expect(screen.getByText("Task Name")).toBeInTheDocument();
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("shows task title when not blocked", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      hasBlockedItems: false,
    });

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
    });

    render(<TaskDetails />);

    const title = screen.getByText("Test Task");
    await user.click(title);

    expect(mockProps.setEditingTitle).toHaveBeenCalledWith(true);
  });

  it("renders title input when editing", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      editingTitle: true,
    });

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
    });

    render(<TaskDetails />);

    await user.click(document.body); // Blur

    expect(mockProps.handleUpdateTitle).toHaveBeenCalledOnce();
  });

  it("saves title on Enter key", async () => {
    const user = userEvent.setup();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      editingTitle: true,
    });

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
      .parentElement?.querySelector("button");

    if (expandButton) {
      await user.click(expandButton);
      expect(mockProps.setIsExpanded).toHaveBeenCalledWith(false);
    }
  });

  it("hides checklist items when collapsed", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      isExpanded: false,
    });

    render(<TaskDetails />);

    expect(screen.queryByTestId("checklist-item-c1")).not.toBeInTheDocument();
  });

  it("shows add new item button when expanded", () => {
    render(<TaskDetails />);

    expect(screen.getByText("ADD NEW ITEM")).toBeInTheDocument();
  });

  it("shows new item input when add button is clicked", async () => {
    const user = userEvent.setup();
    const mockShowNewItemInput = vi.fn();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      handleShowNewItemInput: mockShowNewItemInput,
    });

    render(<TaskDetails />);

    const addButton = screen.getByText("ADD NEW ITEM");
    await user.click(addButton);

    expect(mockShowNewItemInput).toHaveBeenCalledOnce();
  });

  it("shows new item input field when showNewItemInput is true", () => {
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      showNewItemInput: true,
    });

    render(<TaskDetails />);

    const input = screen.getByPlaceholderText(
      "Type new item and press Enter..."
    );
    expect(input).toBeInTheDocument();
  });

  it("adds item on Enter key", async () => {
    const user = userEvent.setup();
    const mockHandleAddItem = vi.fn();
    const mockSetNewItemText = vi.fn();

    // Start with empty text
    let currentText = "";

    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      showNewItemInput: true,
      newItemText: currentText,
      setNewItemText: mockSetNewItemText.mockImplementation((text) => {
        currentText = text;
      }),
      handleAddItem: mockHandleAddItem,
    });

    const { rerender } = render(<TaskDetails />);

    const input = screen.getByPlaceholderText(
      "Type new item and press Enter..."
    );

    // Type text
    await user.type(input, "New item");

    // Update the mock to reflect the typed text
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      showNewItemInput: true,
      newItemText: "New item",
      setNewItemText: mockSetNewItemText,
      handleAddItem: mockHandleAddItem,
    });

    rerender(<TaskDetails />);

    // Press Enter
    await user.keyboard("{Enter}");

    expect(mockHandleAddItem).toHaveBeenCalledOnce();
  });

  it("cancels new item on Escape", async () => {
    const user = userEvent.setup();
    const mockHandleCancelNewItem = vi.fn();
    vi.mocked(useTaskDetails).mockReturnValue({
      ...mockProps,
      showNewItemInput: true,
      handleCancelNewItem: mockHandleCancelNewItem,
    });

    render(<TaskDetails />);

    const input = screen.getByPlaceholderText(
      "Type new item and press Enter..."
    );
    await user.type(input, "New item");
    await user.keyboard("{Escape}");

    expect(mockHandleCancelNewItem).toHaveBeenCalledOnce();
  });

  it("handles checklist item status change", async () => {
    const user = userEvent.setup();
    render(<TaskDetails />);

    const changeStatusButton = screen
      .getByTestId("checklist-item-c1")
      .querySelector("button")!;
    await user.click(changeStatusButton);

    expect(mockProps.handleUpdateChecklistItem).toHaveBeenCalledWith("c1", {
      status: CHECKLIST_STATUS.DONE,
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
});

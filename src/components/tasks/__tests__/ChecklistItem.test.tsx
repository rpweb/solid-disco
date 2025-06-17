import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChecklistItem } from "../ChecklistItem";
import type { ChecklistItemType } from "@/types/db.types";

describe("ChecklistItem", () => {
  const mockItem: ChecklistItemType = {
    id: "1",
    text: "Test checklist item",
    status: "not-started",
  };

  const mockProps = {
    item: mockItem,
    onStatusChange: vi.fn(),
    onTextChange: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders checklist item with text and status icon", () => {
    render(<ChecklistItem {...mockProps} />);

    expect(screen.getByText("Test checklist item")).toBeInTheDocument();
    expect(screen.getByText("○")).toBeInTheDocument(); // not-started icon
  });

  it("shows status dropdown when status button is clicked", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const statusButton = screen.getByRole("button", {
      name: /change status/i,
    });
    await user.click(statusButton);

    expect(screen.getByText("Not Started")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Blocked")).toBeInTheDocument();
    expect(screen.getByText("Final Check")).toBeInTheDocument();
  });

  it("calls onStatusChange when a new status is selected", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const statusButton = screen.getByRole("button", { name: /change status/i });
    await user.click(statusButton);

    const doneOption = screen.getByRole("button", { name: /done/i });
    await user.click(doneOption);

    expect(mockProps.onStatusChange).toHaveBeenCalledWith("done");
  });

  it("shows current status as selected in dropdown", async () => {
    const user = userEvent.setup();
    const inProgressItem = { ...mockItem, status: "in-progress" as const };
    render(
      <ChecklistItem
        {...mockProps}
        item={inProgressItem as ChecklistItemType}
      />
    );

    const statusButton = screen.getByRole("button", {
      name: /change status.*in progress/i,
    });
    await user.click(statusButton);

    // The current status button should have the appropriate styling
    const inProgressOption = screen.getByRole("button", {
      name: /set status to in progress/i,
    });
    expect(inProgressOption).toHaveClass("bg-yellow-100", "text-yellow-600");
  });

  it("enters edit mode when text is clicked", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const textButton = screen.getByRole("button", {
      name: mockItem.text,
    });
    await user.click(textButton);

    expect(screen.getByDisplayValue(mockItem.text)).toBeInTheDocument();
  });

  it("calls onTextChange when editing is completed", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const text = screen.getByText("Test checklist item");
    await user.click(text);

    const input = screen.getByDisplayValue("Test checklist item");
    await user.clear(input);
    await user.type(input, "Updated text");
    fireEvent.blur(input);

    expect(mockProps.onTextChange).toHaveBeenCalledWith("Updated text");
  });

  it("saves text on Enter key press", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const text = screen.getByText("Test checklist item");
    await user.click(text);

    const input = screen.getByDisplayValue("Test checklist item");
    await user.clear(input);
    await user.type(input, "New text[Enter]");

    expect(mockProps.onTextChange).toHaveBeenCalledWith("New text");
  });

  it("cancels editing on Escape key press", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const text = screen.getByText("Test checklist item");
    await user.click(text);

    const input = screen.getByDisplayValue("Test checklist item");
    await user.clear(input);
    await user.type(input, "Changed text");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(mockProps.onTextChange).not.toHaveBeenCalled();
    expect(screen.getByText("Test checklist item")).toBeInTheDocument();
  });

  it("trims whitespace from edited text", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const text = screen.getByText("Test checklist item");
    await user.click(text);

    const input = screen.getByDisplayValue("Test checklist item");
    await user.clear(input);
    await user.type(input, "  Trimmed text  ");
    fireEvent.blur(input);

    expect(mockProps.onTextChange).toHaveBeenCalledWith("Trimmed text");
  });

  it("reverts to original text if edited text is empty", async () => {
    const user = userEvent.setup();
    render(<ChecklistItem {...mockProps} />);

    const text = screen.getByText("Test checklist item");
    await user.click(text);

    const input = screen.getByDisplayValue("Test checklist item");
    await user.clear(input);
    fireEvent.blur(input);

    expect(mockProps.onTextChange).not.toHaveBeenCalled();
    expect(screen.getByText("Test checklist item")).toBeInTheDocument();
  });

  it("shows delete button on hover", async () => {
    const user = userEvent.setup();
    const { container } = render(<ChecklistItem {...mockProps} />);

    const deleteButton = container.querySelector('button[class*="opacity-0"]')!;
    expect(deleteButton).toHaveClass("opacity-0");

    const itemContainer = screen
      .getByText("Test checklist item")
      .closest(".group")!;
    await user.hover(itemContainer);

    await waitFor(() => {
      expect(deleteButton).toHaveClass("group-hover:opacity-100");
    });
  });

  it("renders delete button with correct props", () => {
    render(<ChecklistItem {...mockProps} />);

    const deleteButton = screen.getByRole("button", {
      name: /delete.*test checklist item/i,
    });
    expect(deleteButton).toBeInTheDocument();
  });

  it("applies strikethrough style for done items", () => {
    const doneItem = { ...mockItem, status: "done" as const };
    render(<ChecklistItem {...mockProps} item={doneItem} />);

    const text = screen.getByText("Test checklist item");
    expect(text).toHaveClass("line-through");
    expect(text).toHaveClass("text-gray-500");
  });

  it("shows status label for non 'not-started' items", () => {
    const blockedItem = { ...mockItem, status: "blocked" as const };
    render(
      <ChecklistItem {...mockProps} item={blockedItem as ChecklistItemType} />
    );

    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteButton } from "../DeleteButton";

describe("DeleteButton", () => {
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders delete button with correct aria-label", () => {
    render(<DeleteButton onDelete={mockOnDelete} itemName="Test Item" />);

    expect(
      screen.getByRole("button", { name: /delete test item/i })
    ).toBeInTheDocument();
  });

  it("shows custom confirmation message", async () => {
    const user = userEvent.setup();
    render(
      <DeleteButton
        onDelete={mockOnDelete}
        itemName="Test Item"
        confirmMessage="Are you sure you want to remove this?"
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    await user.click(deleteButton);

    expect(
      screen.getByText("Are you sure you want to remove this?")
    ).toBeInTheDocument();
  });

  it("shows default confirmation message when not provided", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onDelete={mockOnDelete} itemName="Test Item" />);

    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    await user.click(deleteButton);

    expect(screen.getByText("Delete Test Item?")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <DeleteButton
        onDelete={mockOnDelete}
        itemName="Test Item"
        className="custom-class"
      />
    );

    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    expect(deleteButton).toHaveClass("custom-class");
  });

  it("applies custom iconClassName", () => {
    const { container } = render(
      <DeleteButton
        onDelete={mockOnDelete}
        itemName="Test Item"
        iconClassName="w-6 h-6"
      />
    );

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("w-6", "h-6");
  });

  it("stops event propagation when delete button is clicked", async () => {
    const user = userEvent.setup();
    const parentClickHandler = vi.fn();

    render(
      <div onClick={parentClickHandler}>
        <DeleteButton onDelete={mockOnDelete} itemName="Test Item" />
      </div>
    );

    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    await user.click(deleteButton);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  it("calls onDelete when confirmation is accepted", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onDelete={mockOnDelete} itemName="Test Item" />);

    // Click delete button
    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    await user.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole("button", {
      name: /confirm delete/i,
    });
    await user.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("does not call onDelete when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onDelete={mockOnDelete} itemName="Test Item" />);

    // Click delete button
    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    await user.click(deleteButton);

    // Cancel deletion
    const cancelButton = screen.getByRole("button", {
      name: /cancel delete/i,
    });
    await user.click(cancelButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("closes confirmation when clicking outside", async () => {
    const user = userEvent.setup();
    render(<DeleteButton onDelete={mockOnDelete} itemName="Test Item" />);

    // Click delete button
    const deleteButton = screen.getByRole("button", {
      name: /delete test item/i,
    });
    await user.click(deleteButton);

    // Verify confirmation is shown
    expect(screen.getByText("Delete Test Item?")).toBeInTheDocument();

    // Click outside
    await user.click(document.body);

    // Verify confirmation is closed and onDelete was not called
    expect(screen.queryByText("Delete Test Item?")).not.toBeInTheDocument();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../LoginForm";
import { useAuthStore } from "@/stores/authStore";

// Mock the modules
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@/stores/authStore");

describe("LoginForm", () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();
  const mockClearError = vi.fn();

  const defaultAuthState = {
    currentUser: null,
    isLoading: false,
    error: null,
    login: mockLogin,
    clearError: mockClearError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = defaultAuthState;
      return selector(state);
    });
  });

  describe("rendering", () => {
    it("should render login form with all elements", () => {
      render(<LoginForm />);

      expect(screen.getByText("Construction Tasks")).toBeInTheDocument();
      expect(
        screen.getByText("Enter your name to get started")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Your Name")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your name")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Login with your name" })
      ).toBeInTheDocument();
    });

    it("should have autofocus on name input", () => {
      render(<LoginForm />);

      const nameInput = screen.getByLabelText("Your Name");
      expect(nameInput).toHaveFocus();
    });

    it("should have disabled submit button when name is empty", () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", {
        name: "Login with your name",
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("form interactions", () => {
    it("should update name input value", () => {
      render(<LoginForm />);

      const nameInput = screen.getByLabelText("Your Name");
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      expect(nameInput).toHaveValue("John Doe");
    });

    it("should enable submit button when name is entered", () => {
      render(<LoginForm />);

      const nameInput = screen.getByLabelText("Your Name");
      const submitButton = screen.getByRole("button", {
        name: "Login with your name",
      });

      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      expect(submitButton).not.toBeDisabled();
    });

    it("should keep submit button disabled for whitespace-only input", () => {
      render(<LoginForm />);

      const nameInput = screen.getByLabelText("Your Name");
      const submitButton = screen.getByRole("button", {
        name: "Login with your name",
      });

      fireEvent.change(nameInput, { target: { value: "   " } });

      expect(submitButton).toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("should call login with trimmed name on submit", async () => {
      render(<LoginForm />);

      const nameInput = screen.getByLabelText("Your Name");
      const submitButton = screen.getByRole("button", {
        name: "Login with your name",
      });

      fireEvent.change(nameInput, { target: { value: "  John Doe  " } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("John Doe");
      });
    });

    it("should not call login with empty name", async () => {
      render(<LoginForm />);

      const form = screen
        .getByRole("button", { name: "Login with your name" })
        .closest("form")!;
      fireEvent.submit(form);

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should prevent default form submission", () => {
      render(<LoginForm />);

      const form = screen
        .getByRole("button", { name: "Login with your name" })
        .closest("form")!;
      const preventDefaultSpy = vi.fn();

      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(submitEvent, "preventDefault", {
        value: preventDefaultSpy,
      });

      fireEvent.change(screen.getByLabelText("Your Name"), {
        target: { value: "John" },
      });
      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading state", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { ...defaultAuthState, isLoading: true };
        return selector(state);
      });

      render(<LoginForm />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Loading, please wait" })
      ).toBeDisabled();
    });

    it("should disable input during loading", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { ...defaultAuthState, isLoading: true };
        return selector(state);
      });

      render(<LoginForm />);

      const nameInput = screen.getByLabelText("Your Name");
      expect(nameInput).toBeDisabled();
    });
  });

  describe("error handling", () => {
    it("should display error message", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { ...defaultAuthState, error: "Login failed" };
        return selector(state);
      });

      render(<LoginForm />);

      expect(screen.getByText("Login failed")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Dismiss error message" })
      ).toBeInTheDocument();
    });

    it("should call clearError when dismiss button is clicked", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { ...defaultAuthState, error: "Login failed" };
        return selector(state);
      });

      render(<LoginForm />);

      const dismissButton = screen.getByRole("button", {
        name: "Dismiss error message",
      });
      fireEvent.click(dismissButton);

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe("navigation", () => {
    it("should navigate to dashboard when user is logged in", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe" },
        };
        return selector(state);
      });

      render(<LoginForm />);

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    it("should not navigate when user is not logged in", () => {
      render(<LoginForm />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("should have proper container styling", () => {
      const { container } = render(<LoginForm />);

      const minHeightDiv = container.querySelector(".min-h-screen");
      expect(minHeightDiv).toHaveClass("bg-gray-100");
      expect(minHeightDiv).toHaveClass("flex");
      expect(minHeightDiv).toHaveClass("items-center");
      expect(minHeightDiv).toHaveClass("justify-center");
    });

    it("should style error message properly", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = { ...defaultAuthState, error: "Login failed" };
        return selector(state);
      });

      render(<LoginForm />);

      const errorContainer = screen.getByText("Login failed").parentElement;
      expect(errorContainer).toHaveClass("bg-red-50");
      expect(errorContainer).toHaveClass("border-red-200");
      expect(errorContainer).toHaveClass("rounded-md");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { Header } from "../Header";
import { useAuthStore } from "@/stores/authStore";

// Mock the modules
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@/stores/authStore");

describe("Header", () => {
  const mockNavigate = vi.fn();
  const mockLogout = vi.fn();

  const defaultAuthState = {
    currentUser: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: mockLogout,
    clearError: vi.fn(),
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
    it("should render header with title", () => {
      render(<Header />);

      expect(screen.getByText("Construction Tasks")).toBeInTheDocument();
    });

    it("should not render user info when not logged in", () => {
      render(<Header />);

      expect(screen.queryByText(/Welcome,/)).not.toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });

    it("should render user info when logged in", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe", createdAt: Date.now() },
        };
        return selector(state);
      });

      render(<Header />);

      expect(screen.getByText("Welcome, John Doe")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("should render user name correctly with special characters", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: {
            id: "1",
            name: "John-O'Brien & Co.",
            createdAt: Date.now(),
          },
        };
        return selector(state);
      });

      render(<Header />);

      expect(
        screen.getByText("Welcome, John-O'Brien & Co.")
      ).toBeInTheDocument();
    });
  });

  describe("logout functionality", () => {
    it("should call logout and navigate on logout button click", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe", createdAt: Date.now() },
        };
        return selector(state);
      });

      render(<Header />);

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should call logout before navigation", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe", createdAt: Date.now() },
        };
        return selector(state);
      });

      const callOrder: string[] = [];
      mockLogout.mockImplementation(() => {
        callOrder.push("logout");
      });
      mockNavigate.mockImplementation(() => {
        callOrder.push("navigate");
      });

      render(<Header />);

      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(callOrder).toEqual(["logout", "navigate"]);
    });
  });

  describe("styling", () => {
    it("should have proper container styling", () => {
      const { container } = render(<Header />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-white");
      expect(header).toHaveClass("shadow-sm");
      expect(header).toHaveClass("border-b");
      expect(header).toHaveClass("border-gray-200");
    });

    it("should have proper title styling", () => {
      render(<Header />);

      const title = screen.getByText("Construction Tasks");
      expect(title).toHaveClass("text-xl");
      expect(title).toHaveClass("font-semibold");
      expect(title).toHaveClass("text-gray-900");
    });

    it("should have proper user info styling when logged in", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe", createdAt: Date.now() },
        };
        return selector(state);
      });

      render(<Header />);

      const welcomeText = screen.getByText("Welcome, John Doe");
      expect(welcomeText).toHaveClass("text-gray-700");

      const logoutButton = screen.getByText("Logout");
      expect(logoutButton).toHaveClass("text-sm");
      expect(logoutButton).toHaveClass("text-gray-500");
      expect(logoutButton).toHaveClass("hover:text-gray-700");
      expect(logoutButton).toHaveClass("cursor-pointer");
    });

    it("should have proper layout styling", () => {
      const { container } = render(<Header />);

      const maxWidthDiv = container.querySelector(".max-w-7xl");
      expect(maxWidthDiv).toHaveClass("mx-auto");
      expect(maxWidthDiv).toHaveClass("px-4");
      expect(maxWidthDiv).toHaveClass("sm:px-6");
      expect(maxWidthDiv).toHaveClass("lg:px-8");

      const flexDiv = container.querySelector(".flex.justify-between");
      expect(flexDiv).toHaveClass("items-center");
      expect(flexDiv).toHaveClass("h-16");
    });

    it("should have proper user info container styling", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe", createdAt: Date.now() },
        };
        return selector(state);
      });

      const { container } = render(<Header />);

      const userInfoContainer = container.querySelector(
        ".flex.items-center.space-x-4"
      );
      expect(userInfoContainer).toBeInTheDocument();
      expect(userInfoContainer).toHaveClass("flex");
      expect(userInfoContainer).toHaveClass("items-center");
      expect(userInfoContainer).toHaveClass("space-x-4");
    });
  });

  describe("accessibility", () => {
    it("should have accessible logout button", () => {
      vi.mocked(useAuthStore).mockImplementation((selector) => {
        const state = {
          ...defaultAuthState,
          currentUser: { id: "1", name: "John Doe", createdAt: Date.now() },
        };
        return selector(state);
      });

      render(<Header />);

      const logoutButton = screen.getByText("Logout");
      expect(logoutButton.tagName).toBe("BUTTON");
    });
  });
});

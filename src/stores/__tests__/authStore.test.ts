import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAuthStore } from "../authStore";
import { getDatabase } from "@/db/database";

// Mock dependencies
vi.mock("@/db/database");

describe("authStore", () => {
  const mockUser = {
    id: "user1",
    name: "Test User",
    createdAt: Date.now(),
  };

  const mockUserDoc = {
    ...mockUser,
    toJSON: () => mockUser,
  };

  const mockDb = {
    users: {
      find: vi.fn().mockReturnValue({
        exec: vi.fn(),
      }),
      insert: vi.fn().mockResolvedValue(mockUserDoc),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDatabase).mockResolvedValue(mockDb as any);

    // Reset store state
    act(() => {
      useAuthStore.setState({
        currentUser: null,
        isLoading: false,
        error: null,
      });
    });
  });

  describe("login", () => {
    it("successfully logs in an existing user", async () => {
      mockDb.users.find().exec.mockResolvedValueOnce([mockUserDoc]);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login("Test User");
      });

      expect(result.current.currentUser).toEqual({
        id: mockUser.id,
        name: mockUser.name,
      });
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("creates a new user if not exists", async () => {
      mockDb.users.find().exec.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login("New User");
      });

      expect(mockDb.users.insert).toHaveBeenCalledWith({
        id: expect.any(String),
        name: "New User",
        createdAt: expect.any(Number),
      });
      expect(result.current.currentUser).toEqual({
        id: mockUser.id,
        name: mockUser.name,
      });
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("sets loading state during login", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockDb.users.find().exec.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useAuthStore());

      // Start login
      act(() => {
        result.current.login("Test User");
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve promise
      await act(async () => {
        resolvePromise!([mockUserDoc]);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("handles database errors", async () => {
      mockDb.users.find().exec.mockRejectedValueOnce(new Error("DB Error"));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login("Test User");
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.error).toBe("DB Error");
      expect(result.current.isLoading).toBe(false);
    });

    it("queries with correct name selector", async () => {
      mockDb.users.find().exec.mockResolvedValueOnce([mockUserDoc]);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login("Test User");
      });

      expect(mockDb.users.find).toHaveBeenCalledWith({
        selector: { name: "Test User" },
      });
    });
  });

  describe("logout", () => {
    it("clears user state", () => {
      // Set initial user
      act(() => {
        useAuthStore.setState({
          currentUser: { id: "user1", name: "Test User" },
        });
      });

      const { result } = renderHook(() => useAuthStore());

      expect(result.current.currentUser).toEqual({
        id: "user1",
        name: "Test User",
      });

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.currentUser).toBeNull();
    });

    it("clears error on logout", () => {
      // Set initial error
      act(() => {
        useAuthStore.setState({
          currentUser: { id: "user1", name: "Test User" },
          error: "Some error",
        });
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("clearError", () => {
    it("clears the error state", () => {
      act(() => {
        useAuthStore.setState({ error: "Test error" });
      });

      const { result } = renderHook(() => useAuthStore());

      expect(result.current.error).toBe("Test error");

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

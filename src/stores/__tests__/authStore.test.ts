import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAuthStore } from "../authStore";
import { getDatabase } from "@/db/database";
import type { RxDatabase, RxDocument } from "rxdb";
import type {
  RxDatabaseCollections,
  RxUserDocumentType,
} from "@/types/db.types";

// Mock dependencies
vi.mock("@/db/database");

// Mock types
type MockRxUserDocument = RxDocument<RxUserDocumentType> & {
  toJSON: () => RxUserDocumentType;
};

type MockDbMethods = {
  users: {
    find: () => {
      exec: () => Promise<MockRxUserDocument[]>;
    };
    insert: (data: RxUserDocumentType) => Promise<MockRxUserDocument>;
  };
};

describe("authStore", () => {
  const mockUser: RxUserDocumentType = {
    id: "user1",
    name: "Test User",
    createdAt: Date.now(),
  };

  const mockUserDoc: MockRxUserDocument = {
    ...mockUser,
    toJSON: () => mockUser,
  } as MockRxUserDocument;

  const mockDb: MockDbMethods = {
    users: {
      find: vi.fn(() => ({
        exec: vi.fn().mockResolvedValue([mockUserDoc]),
      })),
      insert: vi.fn().mockResolvedValue(mockUserDoc),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDatabase).mockResolvedValue(
      mockDb as unknown as RxDatabase<RxDatabaseCollections>
    );

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
      mockDb.users.find = vi.fn(() => ({
        exec: vi.fn().mockResolvedValue([]),
      }));

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
      let resolvePromise: (value: MockRxUserDocument[]) => void;
      const promise = new Promise<MockRxUserDocument[]>((resolve) => {
        resolvePromise = resolve;
      });

      mockDb.users.find = vi.fn(() => ({
        exec: vi.fn().mockReturnValue(promise),
      }));

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
      mockDb.users.find = vi.fn(() => ({
        exec: vi.fn().mockRejectedValue(new Error("DB Error")),
      }));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login("Test User");
      });

      expect(result.current.currentUser).toBeNull();
      expect(result.current.error).toBe("DB Error");
      expect(result.current.isLoading).toBe(false);
    });

    it("queries with correct name selector", async () => {
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

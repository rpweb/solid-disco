import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDatabase } from "@/db/database";
import type { RxUserDocument } from "@/types/db.types";

interface AuthState {
  currentUser: { id: string; name: string } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: false,
      error: null,

      login: async (name: string) => {
        set({ isLoading: true, error: null });

        try {
          const db = await getDatabase();

          // Try to find existing user
          const existingUsers = await db.users
            .find({
              selector: { name },
            })
            .exec();

          let user: RxUserDocument;

          if (existingUsers.length > 0) {
            // User exists
            user = existingUsers[0];
          } else {
            // Create new user
            user = await db.users.insert({
              id: crypto.randomUUID(),
              name,
              createdAt: Date.now(),
            });
          }

          set({
            currentUser: {
              id: user.id,
              name: user.name,
            },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Login error:", error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
        }
      },

      logout: () => {
        set({ currentUser: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);

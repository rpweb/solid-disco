import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";

export const LoginForm: React.FC = () => {
  const [name, setName] = useState("");
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName) {
      await login(trimmedName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Construction Tasks
            </h1>
            <p className="mt-2 text-gray-600">Enter your name to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-sm text-red-500 underline mt-1 cursor-pointer hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1"
                  aria-label="Dismiss error message"
                >
                  Dismiss
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label={
                isLoading ? "Loading, please wait" : "Login with your name"
              }
              aria-disabled={isLoading || !name.trim()}
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Header } from "@/components/layout/Header";
import { Outlet } from "react-router-dom";

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

import { create } from "zustand";

interface UIState {
  isAddingTask: boolean;
  selectedTaskId: string | null;
  floorPlanImage: string | null;

  // Actions
  setIsAddingTask: (value: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  setFloorPlanImage: (image: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isAddingTask: false,
  selectedTaskId: null,
  floorPlanImage: "/floor-plan.png", // Default floor plan image

  setIsAddingTask: (value) => set({ isAddingTask: value }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setFloorPlanImage: (image) => set({ floorPlanImage: image }),
}));

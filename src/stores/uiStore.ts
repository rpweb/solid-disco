import { create } from "zustand";

export interface UIState {
  isAddingTask: boolean;
  selectedTaskId: string | null;
  hoveredTaskId: string | null;
  floorPlanImage: string | null;

  setIsAddingTask: (value: boolean) => void;
  setSelectedTaskId: (id: string | null) => void;
  setHoveredTaskId: (id: string | null) => void;
  setFloorPlanImage: (image: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isAddingTask: false,
  selectedTaskId: null,
  hoveredTaskId: null,
  floorPlanImage: "/construction-plan.png",

  setIsAddingTask: (value) => set({ isAddingTask: value }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setHoveredTaskId: (id) => set({ hoveredTaskId: id }),
  setFloorPlanImage: (image) => set({ floorPlanImage: image }),
}));

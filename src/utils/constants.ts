import type { ChecklistItem } from "@/types/db.types";

const DEFAULT_CHECKLIST_ITEMS = [
  { text: "Site preparation", status: "not-started" as const },
  { text: "Material delivery", status: "not-started" as const },
  { text: "Installation", status: "not-started" as const },
  { text: "Quality check", status: "not-started" as const },
  { text: "Cleanup", status: "not-started" as const },
];

// Generate default checklist with unique IDs
export const generateDefaultChecklist = (): ChecklistItem[] => {
  return DEFAULT_CHECKLIST_ITEMS.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }));
};

export const statusConfig = {
  "not-started": {
    icon: "○",
    color: "text-gray-400",
    bgColor: "bg-gray-100",
    label: "Not started",
  },
  "in-progress": {
    icon: "◐",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    label: "In Progress",
  },
  blocked: {
    icon: "⚠",
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Blocked",
  },
  "final-check": {
    icon: "◔",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Final Check awaiting",
  },
  done: {
    icon: "✓",
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Done",
  },
} as const;

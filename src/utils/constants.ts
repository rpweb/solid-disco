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

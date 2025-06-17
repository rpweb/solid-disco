import type { ChecklistItemType } from "@/types/db.types";
import { CHECKLIST_STATUS } from "@/types/db.types";

const DEFAULT_CHECKLIST_ITEMS = [
  { text: "Site preparation", status: CHECKLIST_STATUS.NOT_STARTED },
  { text: "Material delivery", status: CHECKLIST_STATUS.NOT_STARTED },
  { text: "Installation", status: CHECKLIST_STATUS.NOT_STARTED },
  { text: "Quality check", status: CHECKLIST_STATUS.NOT_STARTED },
  { text: "Cleanup", status: CHECKLIST_STATUS.NOT_STARTED },
];

// Generate default checklist with unique IDs
export const generateDefaultChecklist = (): ChecklistItemType[] => {
  return DEFAULT_CHECKLIST_ITEMS.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }));
};

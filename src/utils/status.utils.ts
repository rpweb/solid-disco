import { CHECKLIST_STATUS, type ChecklistItemStatus } from "@/types/db.types";

// Status display configuration
export const STATUS_CONFIG = {
  [CHECKLIST_STATUS.NOT_STARTED]: {
    label: "Not Started",
    icon: "○",
    color: "gray",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
    borderClass: "border-gray-600",
    fullClasses: "bg-gray-100 text-gray-600 border-2 border-gray-600",
    badgeClasses: "bg-gray-100 text-gray-800",
  },
  [CHECKLIST_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    icon: "◐",
    color: "yellow",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-600",
    borderClass: "border-yellow-600",
    fullClasses: "bg-yellow-100 text-yellow-600 border-2 border-yellow-600",
    badgeClasses: "bg-yellow-100 text-yellow-800",
  },
  [CHECKLIST_STATUS.BLOCKED]: {
    label: "Blocked",
    icon: "⚠",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-600",
    borderClass: "border-red-600",
    fullClasses: "bg-red-100 text-red-600 border-2 border-red-600",
    badgeClasses: "bg-red-100 text-red-800",
  },
  [CHECKLIST_STATUS.FINAL_CHECK]: {
    label: "Final Check",
    icon: "◔",
    color: "blue",
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
    borderClass: "border-blue-600",
    fullClasses: "bg-blue-100 text-blue-600 border-2 border-blue-600",
    badgeClasses: "bg-blue-100 text-blue-800",
  },
  [CHECKLIST_STATUS.DONE]: {
    label: "Done",
    icon: "✓",
    color: "green",
    bgClass: "bg-green-100",
    textClass: "text-green-600",
    borderClass: "border-green-600",
    fullClasses: "bg-green-100 text-green-600 border-2 border-green-600",
    badgeClasses: "bg-green-100 text-green-800",
  },
} as const;

// Get status configuration
export function getStatusConfig(status: ChecklistItemStatus) {
  return STATUS_CONFIG[status];
}

// Get status label
export function getStatusLabel(status: ChecklistItemStatus): string {
  return STATUS_CONFIG[status].label;
}

// Get status color classes for badges
export function getStatusBadgeClasses(status: ChecklistItemStatus): string {
  return STATUS_CONFIG[status].badgeClasses;
}

// Get full status classes for buttons/checkboxes
export function getStatusFullClasses(status: ChecklistItemStatus): string {
  return STATUS_CONFIG[status].fullClasses;
}

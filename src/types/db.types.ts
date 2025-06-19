import type { RxCollection, RxDocument } from "rxdb";

export const CHECKLIST_STATUS = {
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  BLOCKED: "blocked",
  FINAL_CHECK: "final-check",
  DONE: "done",
} as const;

export type ChecklistItemStatus =
  (typeof CHECKLIST_STATUS)[keyof typeof CHECKLIST_STATUS];

export interface ChecklistItemType {
  id: string;
  text: string;
  status: ChecklistItemStatus;
}

export interface RxUserDocumentType {
  id: string;
  name: string;
  createdAt: number;
}

export interface RxTaskDocumentType {
  id: string;
  userId: string;
  title: string;
  x: number;
  y: number;
  checklist: ChecklistItemType[];
  createdAt: number;
  updatedAt: number;
}

export type RxUserDocument = RxDocument<RxUserDocumentType>;
export type RxUserCollection = RxCollection<RxUserDocumentType>;

export type RxTaskDocument = RxDocument<RxTaskDocumentType>;
export type RxTaskCollection = RxCollection<RxTaskDocumentType>;

export interface RxDatabaseCollections {
  users: RxUserCollection;
  tasks: RxTaskCollection;
}

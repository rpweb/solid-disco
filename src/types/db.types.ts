import type { RxCollection, RxDocument } from "rxdb";

export interface ChecklistItemType {
  id: string;
  text: string;
  status: "not-started" | "in-progress" | "blocked" | "final-check" | "done";
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

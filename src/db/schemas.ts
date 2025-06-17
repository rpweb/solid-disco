import type { RxJsonSchema } from "rxdb";
import type { RxUserDocumentType, RxTaskDocumentType } from "@/types/db.types";

export const userSchema: RxJsonSchema<RxUserDocumentType> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999,
    },
  },
  required: ["id", "name", "createdAt"],
  indexes: ["name"],
};

export const taskSchema: RxJsonSchema<RxTaskDocumentType> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    userId: {
      type: "string",
      ref: "users",
      maxLength: 100,
    },
    title: {
      type: "string",
      minLength: 1,
      maxLength: 200,
    },
    x: {
      type: "number",
      minimum: 0,
      maximum: 100,
      multipleOf: 0.01,
    },
    y: {
      type: "number",
      minimum: 0,
      maximum: 100,
      multipleOf: 0.01,
    },
    checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          text: {
            type: "string",
            maxLength: 200,
          },
          status: {
            type: "string",
            enum: [
              "not-started",
              "in-progress",
              "blocked",
              "final-check",
              "done",
            ],
          },
        },
        required: ["id", "text", "status"],
      },
    },
    createdAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999,
    },
    updatedAt: {
      type: "number",
      multipleOf: 1,
      minimum: 0,
      maximum: 9999999999999,
    },
  },
  required: [
    "id",
    "userId",
    "title",
    "x",
    "y",
    "checklist",
    "createdAt",
    "updatedAt",
  ],
  indexes: ["userId", "createdAt"],
};

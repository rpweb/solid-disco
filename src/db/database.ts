import { createRxDatabase, addRxPlugin, type RxDatabase } from "rxdb";

// Import required plugins
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

import { userSchema, taskSchema } from "./schemas";
import type { RxDatabaseCollections } from "@/types/db.types";

// Import only in development
if (import.meta.env.DEV) {
  import("rxdb/plugins/dev-mode").then((module) => {
    addRxPlugin(module.RxDBDevModePlugin);
  });
}

// Add plugins
addRxPlugin(RxDBQueryBuilderPlugin);

// Database instance
let dbPromise: Promise<RxDatabase<RxDatabaseCollections>> | null = null;

export async function getDatabase(): Promise<
  RxDatabase<RxDatabaseCollections>
> {
  if (!dbPromise) {
    dbPromise = _createDatabase().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

async function _createDatabase(): Promise<RxDatabase<RxDatabaseCollections>> {
  console.log("Creating database...");

  const db = await createRxDatabase<RxDatabaseCollections>({
    name: "constructiontasks",
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageDexie(),
    }),
    ignoreDuplicate: import.meta.env.DEV,
  });

  console.log("Adding collections...");

  await db.addCollections({
    users: {
      schema: userSchema,
    },
    tasks: {
      schema: taskSchema,
    },
  });

  console.log("Database created!");

  // In dev mode, expose database to window for debugging
  if (import.meta.env.DEV) {
    (window as any).db = db;
  }

  return db;
}

import { createRxDatabase, addRxPlugin, type RxDatabase } from "rxdb";

import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

import { userSchema, taskSchema } from "./schemas";
import type { RxDatabaseCollections } from "@/types/db.types";

if (import.meta.env.DEV) {
  import("rxdb/plugins/dev-mode")
    .then((module) => {
      addRxPlugin(module.RxDBDevModePlugin);
    })
    .catch((error) => {
      console.warn("Failed to load RxDB dev-mode plugin:", error);
    });
}

addRxPlugin(RxDBQueryBuilderPlugin);

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
    const windowWithDb = window as Window & {
      db?: RxDatabase<RxDatabaseCollections>;
    };
    windowWithDb.db = db;
  }

  return db;
}

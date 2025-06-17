import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";

// Mock RxDB modules
vi.mock("rxdb", () => ({
  createRxDatabase: vi.fn(),
  addRxPlugin: vi.fn(),
}));

vi.mock("rxdb/plugins/storage-dexie", () => ({
  getRxStorageDexie: vi.fn(),
}));

vi.mock("rxdb/plugins/validate-ajv", () => ({
  wrappedValidateAjvStorage: vi.fn((config) => config),
}));

vi.mock("rxdb/plugins/query-builder", () => ({
  RxDBQueryBuilderPlugin: {},
}));

describe("database", () => {
  const mockDb = {
    addCollections: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module state by clearing the module cache
    vi.resetModules();

    // Setup default mock implementations
    vi.mocked(createRxDatabase).mockResolvedValue(mockDb as any);
    vi.mocked(getRxStorageDexie).mockReturnValue({} as any);
  });

  afterEach(() => {
    // Clean up window.db if set
    if ((window as any).db) {
      delete (window as any).db;
    }
  });

  it("creates database with correct configuration", async () => {
    const { getDatabase } = await import("../database");

    const db = await getDatabase();

    expect(createRxDatabase).toHaveBeenCalledWith({
      name: "constructiontasks",
      storage: expect.objectContaining({
        storage: {},
      }),
      ignoreDuplicate: true,
    });

    expect(db).toBe(mockDb);
  });

  it("uses wrapped validation storage", async () => {
    const { getDatabase } = await import("../database");

    await getDatabase();

    expect(wrappedValidateAjvStorage).toHaveBeenCalledWith({
      storage: {},
    });
  });

  it("adds collections with schemas", async () => {
    const { getDatabase } = await import("../database");

    await getDatabase();

    expect(mockDb.addCollections).toHaveBeenCalledWith({
      users: {
        schema: expect.objectContaining({
          version: 0,
          primaryKey: "id",
          type: "object",
        }),
      },
      tasks: {
        schema: expect.objectContaining({
          version: 0,
          primaryKey: "id",
          type: "object",
        }),
      },
    });
  });

  it("returns same database instance on multiple calls", async () => {
    const { getDatabase } = await import("../database");

    const db1 = await getDatabase();
    const db2 = await getDatabase();

    expect(db1).toBe(db2);
    expect(createRxDatabase).toHaveBeenCalledTimes(1);
  });

  it("handles concurrent calls correctly", async () => {
    const { getDatabase } = await import("../database");

    // Create a delayed mock to simulate async operation
    let resolveCreate: (value: any) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    vi.mocked(createRxDatabase).mockReturnValueOnce(createPromise as any);

    // Start multiple concurrent calls
    const promise1 = getDatabase();
    const promise2 = getDatabase();
    const promise3 = getDatabase();

    // Resolve the creation
    resolveCreate!(mockDb);

    const [db1, db2, db3] = await Promise.all([promise1, promise2, promise3]);

    expect(db1).toBe(db2);
    expect(db2).toBe(db3);
    expect(createRxDatabase).toHaveBeenCalledTimes(1);
  });

  it("sets window.db in dev mode", async () => {
    // Mock dev environment
    vi.stubEnv("DEV", true);

    const { getDatabase } = await import("../database");

    await getDatabase();

    expect((window as any).db).toBe(mockDb);

    vi.unstubAllEnvs();
  });

  it("does not set window.db in production mode", async () => {
    // Mock production environment
    vi.stubEnv("DEV", false);

    const { getDatabase } = await import("../database");

    await getDatabase();

    expect((window as any).db).toBeUndefined();

    vi.unstubAllEnvs();
  });

  it("handles database creation errors", async () => {
    const dbError = new Error("Failed to create database");
    vi.mocked(createRxDatabase).mockRejectedValueOnce(dbError);

    const { getDatabase } = await import("../database");

    await expect(getDatabase()).rejects.toThrow("Failed to create database");
  });

  it("handles collection creation errors", async () => {
    const collectionError = new Error("Failed to add collections");
    mockDb.addCollections.mockRejectedValueOnce(collectionError);

    const { getDatabase } = await import("../database");

    await expect(getDatabase()).rejects.toThrow("Failed to add collections");
  });

  it("resets promise on error to allow retry", async () => {
    const { getDatabase } = await import("../database");

    // First call fails
    const dbError = new Error("Temporary error");
    vi.mocked(createRxDatabase).mockRejectedValueOnce(dbError);

    await expect(getDatabase()).rejects.toThrow("Temporary error");

    // Second call succeeds
    vi.mocked(createRxDatabase).mockResolvedValueOnce(mockDb as any);

    const db = await getDatabase();
    expect(db).toBe(mockDb);
    expect(createRxDatabase).toHaveBeenCalledTimes(2);
  });

  it("handles DB9 error with retry", async () => {
    const { getDatabase } = await import("../database");

    // First call fails with DB9
    const db9Error = { code: "DB9" };
    vi.mocked(createRxDatabase).mockRejectedValueOnce(db9Error);

    const promise = getDatabase();

    // The promise should still be rejected since we don't have window.db
    await expect(promise).rejects.toEqual(db9Error);
  });

  it("logs correct messages during creation", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { getDatabase } = await import("../database");

    await getDatabase();

    expect(consoleSpy).toHaveBeenCalledWith("Creating database...");
    expect(consoleSpy).toHaveBeenCalledWith("Adding collections...");
    expect(consoleSpy).toHaveBeenCalledWith("Database created!");

    consoleSpy.mockRestore();
  });

  it("validates storage is wrapped correctly", async () => {
    const mockStorage = { type: "dexie" };
    vi.mocked(getRxStorageDexie).mockReturnValueOnce(mockStorage as any);

    const { getDatabase } = await import("../database");

    await getDatabase();

    expect(wrappedValidateAjvStorage).toHaveBeenCalledWith({
      storage: mockStorage,
    });
  });
});

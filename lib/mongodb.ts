import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "alkhayr";

/**
 * Thrown when the database is not configured. Route handlers catch this and
 * answer 503 rather than crashing the whole request pipeline.
 */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("MONGODB_URI is not set — see .env.example");
    this.name = "DatabaseNotConfiguredError";
  }
}

// The dev server re-evaluates modules on every hot reload, which would open a
// new pool each time. Cache the promise on globalThis so it is reused.
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (!uri) throw new DatabaseNotConfiguredError();

  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(uri);
}
